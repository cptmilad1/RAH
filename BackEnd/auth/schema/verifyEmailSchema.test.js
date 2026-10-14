const test = require('node:test')
const assert = require('node:assert/strict')
const verifyEmailSchema = require('./verifyEmailSchema')

test('accepts six-digit email verification codes', () => {
  assert.equal(verifyEmailSchema.safeParse({ code: '004281' }).success, true)
})

test('rejects codes that are not exactly six digits', () => {
  for (const code of ['12345', '1234567', 'abcdef', '12 456']) {
    assert.equal(verifyEmailSchema.safeParse({ code }).success, false)
  }
})
