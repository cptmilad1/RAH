import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { getProfile } from '../auth/authApi'
import { useAuthStore } from '../auth/authStore'
import { usePresenceStore } from './presenceStore'

function PresenceConnection() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user?.id) {
      usePresenceStore.getState().setConnected(false)
      usePresenceStore.getState().setUnreadDirectMessages(0)
      return undefined
    }

    const socket = io({ withCredentials: true })
    usePresenceStore.getState().setSocket(socket)
    let accessRefreshAttempted = false

    socket.on('connect', () => {
      accessRefreshAttempted = false
      usePresenceStore.getState().setConnected(true)
    })
    socket.on('disconnect', () => {
      usePresenceStore.getState().setConnected(false)
    })
    socket.on('presence:sync', ({ userId, isOnline }) => {
      usePresenceStore.getState().setPresence(userId, isOnline)
    })
    socket.on('presence:update', ({ userId, isOnline }) => {
      usePresenceStore.getState().setPresence(userId, isOnline)
    })
    socket.on('direct:unread-count', ({ count }) => {
      usePresenceStore.getState().setUnreadDirectMessages(Number(count) || 0)
    })
    socket.on('connect_error', (error) => {
      usePresenceStore.getState().setConnectionError(error.message || 'اتصال سوکت برقرار نشد.')
      if (accessRefreshAttempted) return
      accessRefreshAttempted = true
      getProfile(user.id)
        .then(() => socket.connect())
        .catch((refreshError) => {
          usePresenceStore.getState().setConnectionError(refreshError.message || error.message || 'اتصال سوکت برقرار نشد.')
          accessRefreshAttempted = false
        })
    })

    return () => {
      socket.disconnect()
      usePresenceStore.getState().setSocket(null)
      usePresenceStore.getState().setConnected(false)
    }
  }, [user?.id])

  return null
}

export default PresenceConnection
