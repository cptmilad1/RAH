import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProfile, login as loginRequest, logout as logoutRequest } from './authApi'

const normalizeUser = (nextUser = null) => {
  if (!nextUser) return null

  return {
    ...nextUser,
    role: nextUser.role || 'user',
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (nextUser) => {
        const normalized = normalizeUser(nextUser)
        set({ user: normalized })
        return normalized
      },
      login: async (payload) => {
        set({ loading: true })
        try {
          const result = await loginRequest(payload)
          const profileResult = await getProfile(result.data.id)
          const nextUser = normalizeUser({ ...result.data, ...profileResult.data })
          set({ user: nextUser })
          return nextUser
        } finally {
          set({ loading: false })
        }
      },
      refreshSession: async () => {
        const current = get().user
        if (!current?.id) {
          set({ user: null })
          return null
        }

        try {
          const profile = await getProfile(current.id)
          const nextUser = normalizeUser({ ...current, ...profile.data })
          set({ user: nextUser })
          return nextUser
        } catch {
          set({ user: null })
          return null
        }
      },
      logout: async () => {
        set({ loading: true })
        try {
          await logoutRequest().catch(() => undefined)
        } finally {
          set({ user: null, loading: false })
        }
      },
    }),
    {
      name: 'rah-auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-expired', () => {
    useAuthStore.getState().setUser(null)
  })
}

export const useAuth = () => useAuthStore()
