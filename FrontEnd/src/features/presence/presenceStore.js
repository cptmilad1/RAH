import { create } from 'zustand'

export const usePresenceStore = create((set) => ({
  onlineUsers: {},
  connected: false,
  connectionError: '',
  socket: null,
  unreadDirectMessages: 0,
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected, ...(connected ? { connectionError: '' } : {}) }),
  setConnectionError: (connectionError) => set({ connectionError }),
  setUnreadDirectMessages: (unreadDirectMessages) => set({ unreadDirectMessages }),
  setPresence: (userId, isOnline) => set((state) => ({
    onlineUsers: { ...state.onlineUsers, [String(userId)]: isOnline },
  })),
}))
