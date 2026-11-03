export const SETTINGS_STORAGE_KEY = 'rah-settings-storage'

export const themeOptions = ['light', 'dark', 'system', 'sepia', 'contrast']
export const fontOptions = ['vazirmatn', 'tahoma', 'arial', 'system', 'serif']
export const languageOptions = ['fa', 'en']
export const colorOptions = ['forest', 'ocean', 'violet', 'sunset', 'monochrome']

export const defaultSettings = {
  theme: 'light',
  font: 'vazirmatn',
  language: 'fa',
  color: 'forest',
}

export function getSavedLanguage() {
  if (typeof window === 'undefined') return defaultSettings.language

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return defaultSettings.language
    const language = JSON.parse(stored)?.state?.language
    return languageOptions.includes(language) ? language : defaultSettings.language
  } catch (error) {
    console.warn('Saved language preference could not be read:', error)
    return defaultSettings.language
  }
}
