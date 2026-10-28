require('../config/loadEnv')

const jwt = require('jsonwebtoken')
const db = require('../../DataBase/base/dbBase')
const userRoom = require('./userRoom')
const createPresenceManager = require('./createPresenceManager')

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
  const { syncUserPresence } = createPresenceManager(io)

  io.use(async (socket, next) => {
    try {
      const accessToken = readCookie(socket.handshake.headers.cookie, 'access_token')
      if (!accessToken) return next(new Error('Authentication required.'))

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
      const result = await db.query(
        'SELECT token_version AS "tokenVersion", is_active AS "isActive" FROM users WHERE id = $1',
        [decoded.userId],
      )
      if (!result.rowCount || !result.rows[0].isActive) {
        return next(new Error('Authentication required.'))
      }
      if (Number(decoded.tokenVersion) !== Number(result.rows[0].tokenVersion)) {
        return next(new Error('Session expired.'))
      }

      socket.data.user = { id: String(decoded.userId), role: decoded.role }
      return next()
    } catch {
      return next(new Error('Authentication required.'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.data.user.id
    socket.on('disconnect', () => {
      syncUserPresence(userId).catch((error) => {
        console.error('Presence disconnect check failed:', error.message)
      })
    })

    try {
      await socket.join(userRoom(userId))
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
