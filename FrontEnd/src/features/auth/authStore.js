import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getProfile, login as loginRequest, logout as logoutRequest } from './authApi'
import { useSettingsStore } from '../settings/settingsStore'

const AUTH_STORAGE_KEY = 'rah-auth-storage'

const sanitizeUser = (nextUser = null) => {
  if (!nextUser || typeof nextUser !== 'object') return null

  const safeUser = { ...nextUser }
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'session',
    'sessionToken',
    'authToken',
  ]

  sensitiveFields.forEach((field) => {
    delete safeUser[field]
  })

  return {
    ...safeUser,
    role: safeUser.role || 'user',
  }
}

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear auth storage', error)
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (nextUser) => {
        const normalized = sanitizeUser(nextUser)
        set({ user: normalized })
        return normalized
      },
      login: async (payload) => {
        set({ loading: true })
        try {
          const result = await loginRequest(payload)
          const profileResult = await getProfile(result.data.id)
          await useSettingsStore.getState().loadForUser(result.data.id)
          const nextUser = sanitizeUser({ ...result.data, ...profileResult.data })
          set({ user: nextUser })
          return nextUser
        } finally {
          set({ loading: false })
        }
      },
      refreshSession: async () => {
        const current = get().user
        if (!current?.id) {
          clearAuthStorage()
          set({ user: null })
          return null
        }

        try {
          const profile = await getProfile(current.id)
          const nextUser = sanitizeUser({ ...current, ...profile.data })
          set({ user: nextUser })
          return nextUser
        } catch {
          clearAuthStorage()
          set({ user: null })
          return null
        }
      },
      logout: async () => {
        set({ loading: true })
        try {
          await logoutRequest().catch(() => undefined)
        } finally {
          clearAuthStorage()
          useSettingsStore.getState().resetForLogout()
          set({ user: null, loading: false })
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ user: sanitizeUser(state.user) }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          clearAuthStorage()
          return
        }

        const hydratedUser = sanitizeUser(state?.user)
        if (!hydratedUser) {
          clearAuthStorage()
        }
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-expired', () => {
    clearAuthStorage()
    useSettingsStore.getState().resetForLogout()
    useAuthStore.getState().setUser(null)
  })
}

export const useAuth = () => useAuthStore()
