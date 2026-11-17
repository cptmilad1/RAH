const express = require('express')
const authentication = require('../../auth/middleware/authentication')
const authorize = require('../../auth/middleware/authorize')
const validator = require('../../auth/middleware/validator')
const {
  cancelSchema,
  createRideSchema,
  availabilitySchema,
  ratingSchema,
  statusSchema,
  vipFareSchema,
} = require('../schema/taxiSchemas')
const controller = require('../controller/taxiController')

const router = express.Router()
router.use(authentication)

router.get('/vip-fare', controller.getVipFare)
router.get('/availability', authorize('driver'), controller.getAvailability)
router.put('/availability', authorize('driver'), validator(availabilitySchema), controller.setAvailability)
router.get('/requests/available', authorize('driver'), controller.listAvailable)
router.get('/requests/mine', controller.listMine)
router.post('/requests', authorize('user'), validator(createRideSchema), controller.createRide)
router.post('/requests/:id/accept', authorize('driver'), controller.acceptRide)
router.post('/requests/:id/reject', authorize('driver'), controller.rejectRide)
router.patch('/requests/:id/status', authorize('driver'), validator(statusSchema), controller.updateRideStatus)
router.post('/requests/:id/cancel', authorize('admin', 'driver', 'user'), validator(cancelSchema), controller.cancelRide)
router.post('/requests/:id/rating', authorize('user'), validator(ratingSchema), controller.rateRide)
router.get('/requests/:id', controller.getRide)

router.get('/admin/requests', authorize('admin'), controller.listAdminRides)
router.get('/admin/drivers', authorize('admin'), controller.listAdminDrivers)
router.get('/admin/vip-fare', authorize('admin'), controller.getVipFare)
router.put('/admin/vip-fare', authorize('admin'), validator(vipFareSchema), controller.setVipFare)

module.exports = router