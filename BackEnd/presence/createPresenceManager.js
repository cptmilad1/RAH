const userRoom = require('./userRoom')

function createPresenceManager(io) {
  const pendingChecks = new Map()
  const lastKnownPresence = new Map()

  function syncUserPresence(userId) {
    const key = String(userId)
    const previousCheck = pendingChecks.get(key) || Promise.resolve()
    const nextCheck = previousCheck
      .catch(() => undefined)
      .then(async () => {
        const sockets = await io.in(userRoom(key)).fetchSockets()
        const isOnline = sockets.length > 0

        if (lastKnownPresence.get(key) !== isOnline) {
          lastKnownPresence.set(key, isOnline)
          io.emit('presence:update', { userId: key, isOnline })
        }

        return isOnline
      })

    pendingChecks.set(key, nextCheck)
    nextCheck.finally(() => {
      if (pendingChecks.get(key) === nextCheck) pendingChecks.delete(key)
    }).catch(() => undefined)

    return nextCheck
  }

  return { syncUserPresence }
}

module.exports = createPresenceManager
