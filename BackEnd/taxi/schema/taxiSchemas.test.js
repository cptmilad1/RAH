const test = require('node:test')
const assert = require('node:assert/strict')
const { availabilitySchema, createRideSchema, statusSchema } = require('./taxiSchemas')

const baseRide = {
  pickupAddress: 'Herat City Center',
  destinationAddress: 'Jebrael',
}

test('requires a passenger-proposed fare for Standard requests', () => {
  const result = createRideSchema.safeParse({ ...baseRide, taxiType: 'standard' })
  assert.equal(result.success, false)
  assert.equal(result.error.issues[0].path[0], 'proposedFare')
})

test('preserves the proposed Standard fare and does not require a VIP proposal', () => {
  const standard = createRideSchema.parse({ ...baseRide, taxiType: 'standard', proposedFare: 250 })
  const vip = createRideSchema.parse({ ...baseRide, taxiType: 'vip' })
  assert.equal(standard.proposedFare, 250)
  assert.equal(vip.proposedFare, undefined)
})

test('accepts only supported Taxi status update targets', () => {
  assert.equal(statusSchema.safeParse({ status: 'driver_arriving' }).success, true)
  assert.equal(statusSchema.safeParse({ status: 'cancelled' }).success, false)
})

test('requires explicit boolean values for driver availability', () => {
  assert.equal(availabilitySchema.safeParse({ isOnline: true, isAvailable: true }).success, true)
  assert.equal(availabilitySchema.safeParse({ isOnline: 'true', isAvailable: true }).success, false)
})