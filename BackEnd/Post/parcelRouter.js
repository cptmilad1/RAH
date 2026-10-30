const express = require('express')
const authentication = require('../auth/middleware/authentication')
const authorize = require('../auth/middleware/authorize')
const {
  listParcels,
  createParcel,
  getParcel,
  cancelParcel,
} = require('./controller/parcelController')

const router = express.Router()
const listAvailableParcels = require('./controller/listAvailableParcels')
const acceptAvailableParcel = require('./controller/acceptAvailableParcel')
const {
  confirmHandoffHandler,
  updateDriverStatusHandler,
  confirmDeliveryHandler,
} = require('./controller/parcelTransitions')

router.use(authentication)
router.get('/driver/available', authorize('driver'), listAvailableParcels)
router.post('/driver/available/:trackingCode/accept', authorize('driver'), acceptAvailableParcel)
router.patch('/:trackingCode/confirm-handoff', confirmHandoffHandler)
router.patch('/:trackingCode/driver-status', authorize('driver'), updateDriverStatusHandler)
router.patch('/:trackingCode/confirm-delivery', confirmDeliveryHandler)
router.get('/', listParcels)
router.post('/', createParcel)
router.patch('/:trackingCode/cancel', cancelParcel)
router.get('/:trackingCode', getParcel)

module.exports = router
