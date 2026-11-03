import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locals/en.json'
import fa from './locals/fa.json'
import { getSavedLanguage } from './settingsOptions'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'fa',
  interpolation: {
    escapeValue: false,
  },
})

const syncDocumentLanguage = (language) => {
  if (typeof document === 'undefined') return
  const activeLanguage = languageOptions.has(language) ? language : 'fa'
  document.documentElement.lang = activeLanguage
  document.documentElement.dir = activeLanguage === 'fa' ? 'rtl' : 'ltr'
}

const languageOptions = new Set(['fa', 'en'])
syncDocumentLanguage(i18n.language)
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n
