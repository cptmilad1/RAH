require('../config/loadEnv')

const jwt = require('jsonwebtoken')
const db = require('../../DataBase/base/dbBase')
const userRoom = require('./userRoom')
const PresenceManager = require('./createPresenceManager')
const {
  findChatAccess,
  listParcelMessages,
  createParcelMessage,
} = require('../Post/repositories/parcelConversationRepository')

function readCookie(cookieHeader, name) {
  const cookie = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  if (!cookie) return null

  try {
    return decodeURIComponent(cookie.slice(name.length + 1))
  } catch {
    return null
  }
}

function attachPresence(io) {
  const presenceManager = new PresenceManager(io)
  const syncUserPresence = presenceManager.syncUserPresence.bind(presenceManager)

  io.use(async (socket, next) => {
    try {
      const accessToken = readCookie(socket.handshake.headers.cookie, 'access_token')
      if (!accessToken) return next(new Error('Authentication required.'))

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
      const result = await db.query(
        'SELECT token_version AS "tokenVersion", is_active AS "isActive", role FROM users WHERE id = $1',
        [decoded.userId],
      )
      if (!result.rowCount || !result.rows[0].isActive) {
        return next(new Error('Authentication required.'))
      }
      if (Number(decoded.tokenVersion) !== Number(result.rows[0].tokenVersion)) {
        return next(new Error('Session expired.'))
      }

      socket.data.user = { id: String(decoded.userId), role: result.rows[0].role }
      return next()
    } catch {
      return next(new Error('Authentication required.'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.data.user.id
    const joinedParcels = new Map()
    socket.on('disconnect', () => {
      joinedParcels.clear()
      syncUserPresence(userId).catch((error) => {
        console.error('Presence disconnect check failed:', error.message)
      })
    })

    try {
      await socket.join(userRoom(userId))
      if (socket.data.user.role === 'admin') await socket.join('role:admin')
      socket.on('parcel:join', async (payload = {}) => {
        try {
          const access = await findChatAccess(userId, String(payload.trackingCode || ''), socket.data.user.role)
          if (!access) {
            socket.emit('parcel:chat:error', { trackingCode: payload.trackingCode, message: 'شما عضو گفت‌وگوی این مرسوله نیستید.' })
            return
          }
          const room = `parcel:${access.id}`
          await socket.join(room)
          joinedParcels.set(String(access.id), access.trackingCode)
          socket.emit('parcel:chat:history', {
            trackingCode: access.trackingCode,
            messages: await listParcelMessages(access.id),
          })
        } catch (error) {
          console.error('Parcel chat join failed:', error.message)
          socket.emit('parcel:chat:error', { trackingCode: payload.trackingCode, message: 'اتصال به گفت‌وگوی مرسوله ناموفق بود.' })
        }
      })
      socket.on('parcel:leave', async (payload = {}) => {
        const entry = [...joinedParcels.entries()].find(([, code]) => code === String(payload.trackingCode || ''))
        if (!entry) return
        joinedParcels.delete(entry[0])
        socket.leave(`parcel:${entry[0]}`)
      })
      socket.on('parcel:chat:send', async (payload = {}, acknowledge = () => {}) => {
        const respond = typeof acknowledge === 'function' ? acknowledge : () => {}
        try {
          const access = await findChatAccess(userId, String(payload.trackingCode || ''), socket.data.user.role)
          if (!access || !joinedParcels.has(String(access.id))) {
            respond({ error: 'شما اجازهٔ ارسال پیام در این گفت‌وگو را ندارید.' })
            return
          }
          const message = typeof payload.message === 'string' ? payload.message.trim() : ''
          if (!message || message.length > 2000) {
            respond({ error: 'پیام باید بین ۱ تا ۲۰۰۰ نویسه باشد.' })
            return
          }
          const savedMessage = await createParcelMessage(access.id, userId, message)
          io.to(`parcel:${access.id}`).emit('parcel:chat:message', {
            trackingCode: access.trackingCode,
            message: savedMessage,
          })
          access.participantIds.forEach((participantId) => {
            io.to(userRoom(participantId)).emit('inbox:updated', { trackingCode: access.trackingCode })
          })
          io.to('role:admin').emit('inbox:updated', { trackingCode: access.trackingCode })
          respond({ success: true })
        } catch (error) {
          console.error('Parcel chat message failed:', error.message)
          respond({ error: 'ارسال پیام ناموفق بود.' })
        }
      })
      const isOnline = await syncUserPresence(userId)
      socket.emit('presence:sync', { userId, isOnline })
    } catch (error) {
      console.error('Presence connection setup failed:', error.message)
      socket.disconnect(true)
      return
    }
  })
}

module.exports = attachPresence
