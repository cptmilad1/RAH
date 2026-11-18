const test = require('node:test')
const assert = require('node:assert/strict')
const { canTransition } = require('./rideTransitions')

test('allows each step in the Taxi trip lifecycle', () => {
  assert.equal(canTransition('requested', 'accepted'), true)
  assert.equal(canTransition('accepted', 'driver_arriving'), true)
  assert.equal(canTransition('driver_arriving', 'driver_arrived'), true)
  assert.equal(canTransition('driver_arrived', 'started'), true)
  assert.equal(canTransition('started', 'completed'), true)
})

test('allows cancellation only before a trip starts', () => {
  for (const status of ['requested', 'accepted', 'driver_arriving', 'driver_arrived']) {
    assert.equal(canTransition(status, 'cancelled'), true)
  }
  assert.equal(canTransition('started', 'cancelled'), false)
})

test('rejects skipped, reversed, and terminal transitions', () => {
  assert.equal(canTransition('requested', 'started'), false)
  assert.equal(canTransition('completed', 'accepted'), false)
  assert.equal(canTransition('cancelled', 'accepted'), false)
  assert.equal(canTransition('unknown', 'accepted'), false)
})