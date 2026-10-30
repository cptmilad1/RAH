const { findParcelForUser } = require('../repositories/parcelReadRepository')
const { createHttpError } = require('../services/parcelValidation')

async function getParcel(req, res, next) {
  try {
    const parcel = await findParcelForUser(req.user.userId, req.params.trackingCode)
    if (!parcel) throw createHttpError(404, 'مرسوله پیدا نشد.')
    const isPrivateViewer = req.user.role === 'admin' || req.user.role === 'driver' ||
      parcel.isSender || parcel.isReceiver
    if (!isPrivateViewer) {
      const trackingDetails = {
        trackingCode: parcel.trackingCode,
        status: parcel.status,
        createdAt: parcel.createdAt,
        updatedAt: parcel.updatedAt,
        pickupProvince: parcel.pickupProvince,
        deliveryProvince: parcel.deliveryProvince,
        history: parcel.history,
      }
      return res.status(200).json({ data: trackingDetails })
    }
    return res.status(200).json({
      data: {
        ...parcel,
        canChat: parcel.hasAssignedDriver && (parcel.isSender || parcel.isReceiver || parcel.isAssignedDriver),
      },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = getParcel
