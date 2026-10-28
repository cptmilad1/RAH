const express = require('express')
const authentication = require('../auth/middleware/authentication')
const {
  listParcels,
  createParcel,
  getParcel,
  cancelParcel,
} = require('./controller/parcelController')

const router = express.Router()

router.use(authentication)
router.get('/', listParcels)
router.post('/', createParcel)
router.patch('/:trackingCode/cancel', cancelParcel)
router.get('/:trackingCode', getParcel)

module.exports = router
