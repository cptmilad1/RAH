const express = require('express')
const authentication = require('../auth/middleware/authentication')
const authorize = require('../auth/middleware/authorize')
const {
  listParcels,
  createParcel,
  getParcel,
  cancelParcel,
} = require('./controller/parcelController')

const parcelRouter = express.Router()
const listAvailableParcels = require('./controller/listAvailableParcels')
const acceptAvailableParcel = require('./controller/acceptAvailableParcel')
const listParcelConversations = require('./controller/listParcelConversations')
const {
  confirmHandoffHandler,
  updateDriverStatusHandler,
  confirmDeliveryHandler,
} = require('./controller/parcelTransitions')

parcelRouter.use(authentication)
parcelRouter.get('/driver/available', authorize('driver'), listAvailableParcels)
parcelRouter.post('/driver/available/:trackingCode/accept', authorize('driver'), acceptAvailableParcel)
parcelRouter.patch('/:trackingCode/confirm-handoff', confirmHandoffHandler)
parcelRouter.patch('/:trackingCode/driver-status', authorize('driver'), updateDriverStatusHandler)
parcelRouter.patch('/:trackingCode/confirm-delivery', confirmDeliveryHandler)
parcelRouter.get('/conversations', listParcelConversations)
parcelRouter.get('/', listParcels)
parcelRouter.post('/', createParcel)
parcelRouter.patch('/:trackingCode/cancel', cancelParcel)
parcelRouter.get('/:trackingCode', getParcel)

module.exports = parcelRouter
