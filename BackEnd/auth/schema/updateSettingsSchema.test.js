const test = require('node:test')
const assert = require('node:assert/strict')
const updateSettingsSchema = require('./updateSettingsSchema')

test('accepts a single supported setting', () => {
  assert.equal(updateSettingsSchema.safeParse({ theme: 'dark' }).success, true)
  assert.equal(updateSettingsSchema.safeParse({ language: 'en' }).success, true)
})

test('rejects unsupported, extra, or multiple settings', () => {
  assert.equal(updateSettingsSchema.safeParse({ theme: 'neon' }).success, false)
  assert.equal(updateSettingsSchema.safeParse({ theme: 'dark', color: 'ocean' }).success, false)
  assert.equal(updateSettingsSchema.safeParse({ role: 'admin' }).success, false)
  assert.equal(updateSettingsSchema.safeParse({}).success, false)
})
