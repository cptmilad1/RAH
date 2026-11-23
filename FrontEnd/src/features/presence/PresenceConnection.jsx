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

    const socket = io(
      import.meta.env.VITE_BACKEND_URL,
      { withCredentials: true }
    )

    usePresenceStore.getState().setSocket(socket)
    let accessRefreshAttempted = false

    const handleConnect = () => {
      accessRefreshAttempted = false
      usePresenceStore.getState().setConnected(true)
    }

    const handleDisconnect = () => {
      usePresenceStore.getState().setConnected(false)
    }

    const handlePresence = ({ userId, isOnline }) => {
      usePresenceStore.getState().setPresence(userId, isOnline)
    }

    const handleUnreadCount = ({ count }) => {
      usePresenceStore.getState().setUnreadDirectMessages(Number(count) || 0)
    }

    const handleConnectError = (error) => {
      usePresenceStore.getState().setConnectionError(error.message || 'اتصال سوکت برقرار نشد.')
      if (accessRefreshAttempted) return
      accessRefreshAttempted = true

      getProfile(user.id)
        .then(() => socket.connect())
        .catch((refreshError) => {
          usePresenceStore.getState().setConnectionError(
            refreshError.message || error.message || 'اتصال سوکت برقرار نشد.'
          )
          accessRefreshAttempted = false
        })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('presence:sync', handlePresence)
    socket.on('presence:update', handlePresence)
    socket.on('direct:unread-count', handleUnreadCount)
    socket.on('connect_error', handleConnectError)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('presence:sync', handlePresence)
      socket.off('presence:update', handlePresence)
      socket.off('direct:unread-count', handleUnreadCount)
      socket.off('connect_error', handleConnectError)
      socket.disconnect()
      usePresenceStore.getState().setSocket(null)
      usePresenceStore.getState().setConnected(false)
    }
  }, [user?.id])

  return null
}

export default PresenceConnection