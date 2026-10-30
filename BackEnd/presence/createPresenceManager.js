const userRoom = require('./userRoom')

class PresenceManager {
  constructor(io) {
    this.io = io
    this.pendingChecks = new Map()
    this.lastKnownPresence = new Map()
  }

  syncUserPresence(userId) {
    const key = String(userId)
    const previousCheck = this.pendingChecks.get(key) || Promise.resolve()
    const nextCheck = previousCheck
      .catch(() => undefined)
      .then(async () => {
        const sockets = await this.io.in(userRoom(key)).fetchSockets()
        const isOnline = sockets.length > 0

        if (this.lastKnownPresence.get(key) !== isOnline) {
          this.lastKnownPresence.set(key, isOnline)
          this.io.emit('presence:update', { userId: key, isOnline })
        }

        return isOnline
      })

    this.pendingChecks.set(key, nextCheck)
    nextCheck.finally(() => {
      if (this.pendingChecks.get(key) === nextCheck) this.pendingChecks.delete(key)
    }).catch(() => undefined)

    return nextCheck
  }
}

module.exports = PresenceManager
