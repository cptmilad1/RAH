const { acceptAvailableParcel } = require('../repositories/driverParcelRepository')

async function acceptAvailableParcelHandler(req, res, next) {
  try {
    const result = await acceptAvailableParcel(req.user.userId, req.params.trackingCode)
    req.app.get('io')?.emit('driver:parcels:changed')
    return res.status(200).json({ message: 'مرسوله به شما واگذار شد.', data: result })
  } catch (error) {
    return next(error)
  }
}

module.exports = acceptAvailableParcelHandler