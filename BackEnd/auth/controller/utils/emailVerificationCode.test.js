const test = require('node:test')
const assert = require('node:assert/strict')
const createVerificationCode = require('./emailVerificationCode')

test('creates six-digit numeric email verification codes', () => {
  for (let index = 0; index < 100; index += 1) {
    assert.match(createVerificationCode(), /^\d{6}$/)
  }
})
