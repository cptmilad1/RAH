const test = require('node:test')
const assert = require('node:assert/strict')
const resetPasswordSchema = require('./resetPasswordSchema')

test('accepts a generated reset token and valid password', () => {
  const parsed = resetPasswordSchema.safeParse({
    token: 'a'.repeat(64),
    newPassword: 'a-secure-password',
  })

  assert.equal(parsed.success, true)
})

test('rejects malformed reset tokens and invalid passwords', () => {
  assert.equal(resetPasswordSchema.safeParse({
    token: 'not-a-reset-token',
    newPassword: 'a-secure-password',
  }).success, false)
  assert.equal(resetPasswordSchema.safeParse({
    token: 'a'.repeat(64),
    newPassword: 'short',
  }).success, false)
})
