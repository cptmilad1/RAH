import { create } from 'zustand'

export const usePresenceStore = create((set) => ({
  onlineUsers: {},
  connected: false,
  connectionError: '',
  socket: null,
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected, ...(connected ? { connectionError: '' } : {}) }),
  setConnectionError: (connectionError) => set({ connectionError }),
  setPresence: (userId, isOnline) => set((state) => ({
    onlineUsers: { ...state.onlineUsers, [String(userId)]: isOnline },
  })),
}))
