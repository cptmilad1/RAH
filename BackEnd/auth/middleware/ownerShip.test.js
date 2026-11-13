const test = require('node:test')
const assert = require('node:assert/strict')
const ownerShip = require('./ownerShip')

test('allows a user to edit their own profile', () => {
  let nextCalled = false
  const response = {
    status() {
      return this
    },
    json() {
      assert.fail('Expected the request to be allowed.')
    },
  }

  ownerShip(
    { user: { userId: 'user-1', role: 'user' }, params: { id: 'user-1' } },
    response,
    () => { nextCalled = true },
  )

  assert.equal(nextCalled, true)
})

test('allows admins to edit another user profile', () => {
  let nextCalled = false
  const response = {
    status() {
      return this
    },
    json() {
      assert.fail('Expected the admin request to be allowed.')
    },
  }

  ownerShip(
    { user: { userId: 'admin-1', role: 'admin' }, params: { id: 'user-2' } },
    response,
    () => { nextCalled = true },
  )

  assert.equal(nextCalled, true)
})

test('rejects attempts to edit another user profile', () => {
  let responseStatus
  let responseBody
  let nextCalled = false
  const response = {
    status(status) {
      responseStatus = status
      return this
    },
    json(body) {
      responseBody = body
    },
  }

  ownerShip(
    { user: { userId: 'user-1', role: 'user' }, params: { id: 'user-2' } },
    response,
    () => { nextCalled = true },
  )

  assert.equal(responseStatus, 403)
  assert.deepEqual(responseBody, { message: 'you cant access to this route or data!' })
  assert.equal(nextCalled, false)
})
