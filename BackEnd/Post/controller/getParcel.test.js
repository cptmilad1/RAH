const test = require('node:test')
const assert = require('node:assert/strict')
const { canViewPrivateParcelFields } = require('./getParcel')

test('does not disclose private parcel fields to an unassigned driver', () => {
  assert.equal(canViewPrivateParcelFields('driver', {
    isSender: false,
    isReceiver: false,
    isAssignedDriver: false,
  }), false)
})

test('allows private parcel fields only to a participant, assigned driver, or admin', () => {
  assert.equal(canViewPrivateParcelFields('driver', {
    isSender: false,
    isReceiver: false,
    isAssignedDriver: true,
  }), true)
  assert.equal(canViewPrivateParcelFields('user', {
    isSender: true,
    isReceiver: false,
    isAssignedDriver: false,
  }), true)
  assert.equal(canViewPrivateParcelFields('admin', {}), true)
})
