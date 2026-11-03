const { findParcelForUser } = require('../repositories/parcelReadRepository')
const { createHttpError } = require('../services/parcelValidation')

function canViewPrivateParcelFields(role, parcel) {
  return role === 'admin' || parcel.isSender || parcel.isReceiver || parcel.isAssignedDriver
}

async function getParcel(req, res, next) {
  try {
    const parcel = await findParcelForUser(req.user.userId, req.params.trackingCode)
    if (!parcel) throw createHttpError(404, 'مرسوله پیدا نشد.')
    const isPrivateViewer = canViewPrivateParcelFields(req.user.role, parcel)
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
        canChat: parcel.hasAssignedDriver && (
          req.user.role === 'admin' ||
          parcel.isSender ||
          parcel.isReceiver ||
          parcel.isAssignedDriver
        ),
      },
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = getParcel
module.exports.canViewPrivateParcelFields = canViewPrivateParcelFields
