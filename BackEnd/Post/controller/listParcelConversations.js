const { findConversationsForUser } = require('../repositories/parcelInboxRepository')

async function listParcelConversations(req, res, next) {
  try {
    const conversations = await findConversationsForUser(req.user.userId, req.user.role)
    return res.status(200).json({ data: conversations })
  } catch (error) {
    return next(error)
  }
}

module.exports = listParcelConversations
