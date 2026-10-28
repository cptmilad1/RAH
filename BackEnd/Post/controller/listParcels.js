const { findParcelsForUser } = require('../repositories/parcelReadRepository')

async function listParcels(req, res, next) {
  try {
    const parcels = await findParcelsForUser(req.user.userId, req.user.role)
    return res.status(200).json({ data: parcels })
  } catch (error) {
    return next(error)
  }
}

module.exports = listParcels
