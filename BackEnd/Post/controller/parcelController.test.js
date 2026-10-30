const test = require('node:test')
const assert = require('node:assert/strict')
const { validateCreatePayload } = require('../services/parcelValidation')

const validPayload = {
  receiver: { name: 'رضا رضایی', phone: '۰۹۱۲۳۴۵۶۷۸۹' },
  pickup: { province: 'تهران', city: 'تهران', addressLine: 'خیابان ولیعصر' },
  delivery: { province: 'فارس', city: 'شیراز', addressLine: 'بلوار ارم' },
  itemName: 'کتاب',
  quantity: 2,
  weightKg: 1.5,
  description: 'بستهٔ آزمایشی',
}

test('validates shipment input and normalizes Persian phone digits', () => {
  const result = validateCreatePayload(validPayload)
  assert.equal(result.receiverPhone, '09123456789')
  assert.equal(result.quantity, 2)
  assert.equal(result.weightKg, 1.5)
  assert.equal(result.pickupProvince, 'تهران')
})

test('rejects a missing receiver name', () => {
  assert.throws(
    () => validateCreatePayload({ ...validPayload, receiver: { ...validPayload.receiver, name: ' ' } }),
    (error) => error.status === 400,
  )
})

test('requires a province for both parcel addresses', () => {
  assert.throws(
    () => validateCreatePayload({ ...validPayload, pickup: { ...validPayload.pickup, province: '' } }),
    (error) => error.status === 400,
  )
})

test('rejects invalid shipment weight and phone numbers', () => {
  assert.throws(
    () => validateCreatePayload({ ...validPayload, weightKg: 0 }),
    (error) => error.status === 400,
  )
  assert.throws(
    () => validateCreatePayload({ ...validPayload, receiver: { ...validPayload.receiver, phone: 'abc' } }),
    (error) => error.status === 400,
  )
})
