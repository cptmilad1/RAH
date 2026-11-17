const service = require('../services/taxiService')

function controller(action) {
  return async (req, res, next) => {
    try {
      const result = await action(req)
      return res.json({ data: result })
    } catch (error) {
      return next(error)
    }
  }
}

const listAvailable = controller((req) => service.listAvailableRides(req.user.userId))
const listMine = controller((req) => service.listMyRides(req.user.userId, req.user.role))
const getRide = controller((req) => service.getRide(req.params.id, req.user.userId, req.user.role))
const createRide = controller(async (req) => ({
  message: 'درخواست تاکسی ثبت شد.',
  ride: await service.createRide(req.user.userId, req.body),
}))
const acceptRide = controller(async (req) => ({
  message: 'درخواست تاکسی به شما واگذار شد.',
  ...(await service.acceptRide(req.params.id, req.user.userId)),
}))
const rejectRide = controller(async (req) => ({
  message: 'درخواست برای شما رد شد و برای رانندگان دیگر در دسترس می‌ماند.',
  ...(await service.rejectRide(req.params.id, req.user.userId)),
}))
const updateRideStatus = controller(async (req) => ({
  message: 'وضعیت سفر به‌روز شد.',
  ...(await service.updateRideStatus(req.params.id, req.user.userId, req.body.status)),
}))
const cancelRide = controller(async (req) => ({
  message: 'سفر تاکسی لغو شد.',
  ...(await service.cancelRide(req.params.id, req.user.userId, req.user.role, req.body.reason)),
}))
const rateRide = controller(async (req) => ({
  message: 'امتیاز شما ثبت شد.',
  rating: await service.rateRide(req.params.id, req.user.userId, req.body.score, req.body.comment),
}))
const listAdminRides = controller(() => service.listAdminRides())
const listAdminDrivers = controller(() => service.listAdminDrivers())
const getVipFare = controller(() => service.getVipFare())
const setVipFare = controller((req) => service.setVipFare(req.body.fare))
const getAvailability = controller((req) => service.getDriverAvailability(req.user.userId))
const setAvailability = controller((req) => service.setDriverAvailability(
  req.user.userId,
  req.body.isOnline,
  req.body.isAvailable,
))

module.exports = {
  acceptRide,
  cancelRide,
  createRide,
  getRide,
  getAvailability,
  getVipFare,
  listAdminDrivers,
  listAdminRides,
  listAvailable,
  listMine,
  rateRide,
  rejectRide,
  setVipFare,
  setAvailability,
  updateRideStatus,
}