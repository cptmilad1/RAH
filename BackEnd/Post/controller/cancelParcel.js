const { cancelParcel } = require('../repositories/parcelWriteRepository')
const { requiredText } = require('../services/parcelValidation')

async function cancelParcelHandler(req, res, next) {
  try {
    const reason = requiredText(req.body?.reason, 'دلیل لغو', 500)
    await cancelParcel(req.user.userId, req.user.role, req.params.trackingCode, reason)
    return res.status(200).json({ message: 'مرسوله لغو شد.' })
  } catch (error) {
    return next(error)
  }
}

module.exports = cancelParcelHandler
