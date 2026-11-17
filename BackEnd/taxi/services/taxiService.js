const repository = require('../repositories/taxiRepository')
const httpError = require('../utils/httpError')
const { transitions } = require('./rideTransitions')

function parseRideId(value) {
  if (!/^[1-9]\d*$/.test(String(value || ''))) {
    throw httpError(400, 'شناسهٔ سفر معتبر نیست.')
  }
  return value
}

function requireOperation(result) {
  if (result.error === 'not_found') throw httpError(404, 'سفر تاکسی پیدا نشد.')
  if (result.error === 'unavailable') throw httpError(409, 'این درخواست دیگر در دسترس نیست.')
  if (result.error === 'driver_ineligible') throw httpError(403, 'حساب رانندهٔ تأییدشده برای این عملیات لازم است.')
  if (result.error === 'forbidden') throw httpError(403, 'اجازهٔ انجام این عملیات را ندارید.')
  if (result.error === 'transition') throw httpError(409, 'تغییر وضعیت سفر مجاز نیست.')
  return result
}

async function createRide(userId, data) {
  let fare
  if (data.taxiType === 'standard') {
    fare = data.proposedFare
  } else {
    fare = await repository.getVipFare()
    if (!Number.isFinite(fare) || fare <= 0) {
      throw httpError(503, 'کرایهٔ تاکسی VIP هنوز توسط مدیر تنظیم نشده است.')
    }
  }
  return repository.createRide(userId, data, fare)
}

async function getRide(rideId, userId, role) {
  const ride = await repository.getRideById(parseRideId(rideId))
  if (!ride) throw httpError(404, 'سفر تاکسی پیدا نشد.')
  const isPassenger = String(ride.passengerId) === String(userId)
  const isAssignedDriver = String(ride.driverUserId) === String(userId)
  if (role !== 'admin' && !isPassenger && !isAssignedDriver) {
    throw httpError(403, 'اجازهٔ مشاهدهٔ این سفر را ندارید.')
  }
  return ride
}

async function listMyRides(userId, role) {
  return repository.listRidesForUser(userId, role)
}

async function listAvailableRides(userId) {
  return repository.listAvailableRides(userId)
}

async function getDriverAvailability(userId) {
  return repository.getDriverAvailability(userId)
}

async function setDriverAvailability(userId, isOnline, isAvailable) {
  const result = await repository.setDriverAvailability(userId, isOnline, isAvailable)
  if (result.error === 'driver_ineligible') throw httpError(403, 'حساب رانندهٔ تأییدشده برای این عملیات لازم است.')
  if (result.error === 'busy') throw httpError(409, 'تا پایان سفر جاری نمی‌توانید دسترسی رانندگی را فعال کنید.')
  return result
}

async function acceptRide(rideId, userId) {
  return requireOperation(await repository.acceptRide(parseRideId(rideId), userId))
}

async function rejectRide(rideId, userId) {
  return requireOperation(await repository.rejectRide(parseRideId(rideId), userId))
}

async function updateRideStatus(rideId, userId, status) {
  if (!Object.values(transitions).some((nextStatuses) => nextStatuses.includes(status))) {
    throw httpError(400, 'وضعیت انتخاب‌شده معتبر نیست.')
  }
  return requireOperation(await repository.updateRideStatus(parseRideId(rideId), userId, status, transitions))
}

async function cancelRide(rideId, userId, role, reason) {
  return requireOperation(await repository.cancelRide(parseRideId(rideId), userId, role, reason))
}

async function rateRide(rideId, passengerId, score, comment) {
  const rating = await repository.rateRide(parseRideId(rideId), passengerId, score, comment)
  if (!rating) throw httpError(409, 'فقط سفر تکمیل‌شدهٔ خود را می‌توانید امتیاز دهید.')
  return rating
}

async function getVipFare() {
  return repository.getVipFare()
}

async function setVipFare(fare) {
  return repository.setVipFare(fare)
}

async function listAdminDrivers() {
  return repository.listAdminDrivers()
}

module.exports = {
  acceptRide,
  cancelRide,
  createRide,
  getRide,
  getDriverAvailability,
  getVipFare,
  listAdminDrivers,
  listAdminRides: () => repository.listRidesForUser(null, 'admin'),
  listAvailableRides,
  listMyRides,
  rateRide,
  rejectRide,
  setVipFare,
  setDriverAvailability,
  updateRideStatus,
}