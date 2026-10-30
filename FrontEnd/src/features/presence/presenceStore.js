import { create } from 'zustand'

export const usePresenceStore = create((set) => ({
  onlineUsers: {},
  connected: false,
  socket: null,
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  setPresence: (userId, isOnline) => set((state) => ({
    onlineUsers: { ...state.onlineUsers, [String(userId)]: isOnline },
  })),
}))
