const {
  getDirectConversation,
  getUnreadMessageCount,
  listDirectConversations,
  sendDirectMessage,
} = require('../repositories/directMessageRepository')

function isValidUserId(value) {
  return /^[1-9]\d*$/.test(value || '')
}

async function listConversations(req, res, next) {
  try {
    const conversations = await listDirectConversations(req.user.userId)
    return res.json({ data: conversations })
  } catch (error) {
    return next(error)
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await getUnreadMessageCount(req.user.userId)
    return res.json({ data: { count } })
  } catch (error) {
    return next(error)
  }
}

async function getConversation(req, res, next) {
  const targetId = req.params.userId
  if (!isValidUserId(targetId)) return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  if (String(req.user.userId) === String(targetId)) {
    return res.status(400).json({ message: 'نمی‌توانید با حساب خودتان گفت‌وگو کنید.' })
  }
  try {
    const conversation = await getDirectConversation(req.user.userId, targetId)
    if (!conversation) return res.status(404).json({ message: 'کاربر پیدا نشد.' })
    return res.json({ data: conversation })
  } catch (error) {
    return next(error)
  }
}

async function createMessage(req, res, next) {
  const targetId = req.params.userId
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!isValidUserId(targetId)) return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  if (String(req.user.userId) === String(targetId)) {
    return res.status(400).json({ message: 'نمی‌توانید برای خودتان پیام بفرستید.' })
  }
  if (!message || message.length > 2000) {
    return res.status(400).json({ message: 'پیام باید بین ۱ تا ۲۰۰۰ نویسه باشد.' })
  }

  try {
    const result = await sendDirectMessage(req.user.userId, targetId, message)
    if (result.notFound) return res.status(404).json({ message: 'کاربر پیدا نشد.' })
    if (result.blocked) return res.status(403).json({ message: 'ارسال پیام ممکن نیست؛ یکی از کاربران دیگری را مسدود کرده است.' })
    return res.status(201).json({ data: result.message })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listConversations, getConversation, createMessage, getUnreadCount }
