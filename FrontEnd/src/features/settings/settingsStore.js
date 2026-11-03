import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  colorOptions,
  defaultSettings,
  fontOptions,
  languageOptions,
  SETTINGS_STORAGE_KEY,
  themeOptions,
} from './settingsOptions'
import { getUserSettings, updateUserSetting } from './settingsApi'
import i18n from './i18n'

let settingsLoadPromise = null
let settingsLoadGeneration = 0

const isValidSetting = {
  theme: (value) => themeOptions.includes(value),
  font: (value) => fontOptions.includes(value),
  language: (value) => languageOptions.includes(value),
  color: (value) => colorOptions.includes(value),
}

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      ...defaultSettings,
      syncStatus: 'idle',
      loadedUserId: null,
      loadForUser: async (userId) => {
        if (!userId || String(get().loadedUserId) === String(userId)) return
        if (settingsLoadPromise) {
          if (settingsLoadPromise.userId === String(userId)) return settingsLoadPromise.promise
          await settingsLoadPromise.promise.catch(() => undefined)
          return get().loadForUser(userId)
        }

        const generation = settingsLoadGeneration
        const promise = (async () => {
          set({ syncStatus: 'loading' })
          try {
            const result = await getUserSettings()
            const serverSettings = Object.fromEntries(
              Object.keys(defaultSettings)
                .filter((key) => isValidSetting[key](result.data?.[key]))
                .map((key) => [key, result.data[key]]),
            )
            const nextSettings = { ...defaultSettings, ...serverSettings }
            await i18n.changeLanguage(nextSettings.language)
            if (generation !== settingsLoadGeneration) return
            set({
              ...nextSettings,
              loadedUserId: String(userId),
              syncStatus: 'saved',
            })
          } catch (error) {
            if (generation !== settingsLoadGeneration) return
            set({ syncStatus: 'error' })
            console.error('User settings could not be loaded from the database:', error.message)
            throw error
          }
        })()

        settingsLoadPromise = { userId: String(userId), promise }
        try {
          return await promise
        } finally {
          if (settingsLoadPromise?.promise === promise) settingsLoadPromise = null
        }
      },
      setPreference: async (key, value) => {
        if (!isValidSetting[key]?.(value)) return false

        const previousValue = get()[key]
        set({ [key]: value, syncStatus: 'saving' })
        if (key === 'language') await i18n.changeLanguage(value)

        try {
          const result = await updateUserSetting({ [key]: value })
          const serverSettings = Object.fromEntries(
            Object.keys(defaultSettings)
              .filter((settingKey) => isValidSetting[settingKey](result.data?.[settingKey]))
              .map((settingKey) => [settingKey, result.data[settingKey]]),
          )
          set({ ...serverSettings, syncStatus: 'saved' })
          return true
        } catch (error) {
          set({ [key]: previousValue, syncStatus: 'error' })
          if (key === 'language') await i18n.changeLanguage(previousValue)
          console.error('User setting could not be saved to the database:', error.message)
          return false
        }
      },
      resetForLogout: () => {
        settingsLoadGeneration += 1
        set({ ...defaultSettings, loadedUserId: null, syncStatus: 'idle' })
        i18n.changeLanguage(defaultSettings.language)
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ theme, font, language, color }) => ({ theme, font, language, color }),
      merge: (persistedState, currentState) => {
        const safeState = { ...currentState }
        Object.keys(defaultSettings).forEach((key) => {
          if (isValidSetting[key](persistedState?.[key])) {
            safeState[key] = persistedState[key]
          }
        })
        return safeState
      },
    },
  ),
)
