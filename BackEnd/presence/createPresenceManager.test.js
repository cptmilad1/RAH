const test = require('node:test')
const assert = require('node:assert/strict')
const createPresenceManager = require('./createPresenceManager')

test('keeps a user online until the last device disconnects', async () => {
  const connectedSockets = new Set()
  const emitted = []
  const io = {
    in: (room) => ({
      fetchSockets: async () => room === 'user:42' ? [...connectedSockets] : [],
    }),
    emit: (event, payload) => emitted.push({ event, payload }),
  }
  const presence = createPresenceManager(io)

  connectedSockets.add('phone')
  assert.equal(await presence.syncUserPresence(42), true)
  connectedSockets.add('laptop')
  assert.equal(await presence.syncUserPresence(42), true)
  connectedSockets.delete('phone')
  assert.equal(await presence.syncUserPresence(42), true)
  connectedSockets.delete('laptop')
  assert.equal(await presence.syncUserPresence(42), false)

  assert.deepEqual(emitted.map(({ payload }) => payload), [
    { userId: '42', isOnline: true },
    { userId: '42', isOnline: false },
  ])
})

test('serializes simultaneous presence checks for one user', async () => {
  let resolveFirst
  let calls = 0
  const emitted = []
  const io = {
    in: () => ({
      fetchSockets: () => {
        calls += 1
        if (calls === 1) {
          return new Promise((resolve) => { resolveFirst = resolve })
        }
        return Promise.resolve(['phone'])
      },
    }),
    emit: (event, payload) => emitted.push(payload),
  }
  const presence = createPresenceManager(io)

  const firstCheck = presence.syncUserPresence(42)
  await new Promise((resolve) => setImmediate(resolve))
  const secondCheck = presence.syncUserPresence(42)
  resolveFirst([])
  await Promise.all([firstCheck, secondCheck])

  assert.deepEqual(emitted, [
    { userId: '42', isOnline: false },
    { userId: '42', isOnline: true },
  ])
})
