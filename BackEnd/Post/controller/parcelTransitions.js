const {
  confirmHandoff,
  updateDriverParcelStatus,
  confirmDelivery,
} = require('../repositories/parcelTransitionRepository')

function publishUpdate(req, result) {
  const io = req.app.get('io')
  io?.to(`parcel:${result.id}`).emit('parcel:updated', result)
  io?.emit('driver:parcels:changed')
}

async function confirmHandoffHandler(req, res, next) {
  try {
    const result = await confirmHandoff(req.user.userId, req.params.trackingCode)
    publishUpdate(req, result)
    return res.status(200).json({ message: 'تحویل مرسوله به راننده تأیید شد.', data: result })
  } catch (error) {
    return next(error)
  }
}

async function updateDriverStatusHandler(req, res, next) {
  try {
    const { status } = req.body || {}
    if (!['in_transit', 'delivery_pending_confirmation'].includes(status)) {
      return res.status(400).json({ message: 'وضعیت انتخاب‌شده معتبر نیست.' })
    }
    const result = await updateDriverParcelStatus(req.user.userId, req.params.trackingCode, status)
    publishUpdate(req, result)
    return res.status(200).json({ message: 'وضعیت مرسوله به‌روزرسانی شد.', data: result })
  } catch (error) {
    return next(error)
  }
}

async function confirmDeliveryHandler(req, res, next) {
  try {
    const result = await confirmDelivery(req.user.userId, req.params.trackingCode)
    publishUpdate(req, result)
    return res.status(200).json({ message: 'دریافت مرسوله تأیید شد.', data: result })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  confirmHandoffHandler,
  updateDriverStatusHandler,
  confirmDeliveryHandler,
}
