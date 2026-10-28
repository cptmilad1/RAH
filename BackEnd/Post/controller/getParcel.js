const { findParcelForUser } = require('../repositories/parcelReadRepository')
const { createHttpError } = require('../services/parcelValidation')

async function getParcel(req, res, next) {
  try {
    const parcel = await findParcelForUser(req.user.userId, req.user.role, req.params.trackingCode)
    if (!parcel) throw createHttpError(404, 'مرسوله پیدا نشد.')
    return res.status(200).json({ data: parcel })
  } catch (error) {
    return next(error)
  }
}

module.exports = getParcel
