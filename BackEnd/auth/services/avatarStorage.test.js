const test = require('node:test')
const assert = require('node:assert/strict')
const { getImageExtension } = require('./avatarStorage')

test('accepts supported avatar image signatures', () => {
  assert.equal(getImageExtension(Buffer.from([0xff, 0xd8, 0xff, 0x00])), '.jpg')
  assert.equal(getImageExtension(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), '.png')

  const webp = Buffer.alloc(12)
  webp.write('RIFF', 0, 'ascii')
  webp.write('WEBP', 8, 'ascii')
  assert.equal(getImageExtension(webp), '.webp')
})

test('rejects files without a supported image signature', () => {
  assert.equal(getImageExtension(Buffer.from('<svg></svg>')), null)
  assert.equal(getImageExtension(Buffer.alloc(0)), null)
})
