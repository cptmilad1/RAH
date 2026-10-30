const test = require('node:test')
const assert = require('node:assert/strict')
const driverApplicationSchema = require('./driverApplicationSchema')

const validApplication = {
  province: 'کابل',
  licenseNumber: 'LIC-123',
  licenseExpiry: '2030-01-01',
  vehicleMake: 'تویوتا',
  vehicleModel: 'کرولا',
  vehicleYear: 2020,
  vehicleColor: 'سفید',
  plateNumber: '12345',
}

test('accepts complete driver and vehicle details', () => {
  assert.equal(driverApplicationSchema.safeParse(validApplication).success, true)
})

test('rejects missing vehicle model and invalid license expiry', () => {
  assert.equal(driverApplicationSchema.safeParse({
    ...validApplication,
    vehicleModel: '',
    licenseExpiry: 'not-a-date',
  }).success, false)
})
