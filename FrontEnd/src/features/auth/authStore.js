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

const readStoredUser = () => {
  try {
    const saved = localStorage.getItem('rah_user')
    return saved ? normalizeUser(JSON.parse(saved)) : null
  } catch {
    localStorage.removeItem('rah_user')
    return null
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: readStoredUser(),
      loading: false,
      setUser: async (nextUser) => {
        const normalized = normalizeUser(nextUser)
        set({ user: normalized })
        localStorage.setItem('rah_user', JSON.stringify(normalized))
        return normalized
      },
      login: async (payload) => {
        set({ loading: true })
        try {
          const result = await loginRequest(payload)
          const profile = await getProfile(result.data.id)
          const nextUser = normalizeUser({ ...result.data, ...profile })
          localStorage.setItem('rah_user', JSON.stringify(nextUser))
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
          localStorage.removeItem('rah_user')
          return null
        }

        try {
          const profile = await getProfile(current.id)
          const nextUser = normalizeUser({ ...current, ...profile })
          localStorage.setItem('rah_user', JSON.stringify(nextUser))
          set({ user: nextUser })
          return nextUser
        } catch {
          localStorage.removeItem('rah_user')
          set({ user: null })
          return null
        }
      },
      logout: async () => {
        set({ loading: true })
        try {
          await logoutRequest().catch(() => undefined)
        } finally {
          localStorage.removeItem('rah_user')
          set({ user: null, loading: false })
        }
      },
    }),
    {
      name: 'rah_user',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {
        const current = readStoredUser()
        if (current) {
          useAuthStore.setState({ user: current })
        }
      },
    },
  ),
)

export const useAuth = () => useAuthStore()

