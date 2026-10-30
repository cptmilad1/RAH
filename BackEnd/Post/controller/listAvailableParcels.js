const { findAvailableParcels } = require('../repositories/driverParcelRepository')

async function listAvailableParcels(req, res, next) {
  try {
    const result = await findAvailableParcels(req.user.userId)
    return res.status(200).json({ data: result })
  } catch (error) {
    return next(error)
  }
}

module.exports = listAvailableParcels