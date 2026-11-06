import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fa from './fa.json'
import { getSavedLanguage } from '../utils/settingsOptions'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fa: { translation: fa },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'fa',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
})

const syncDocumentLanguage = (language) => {
  if (typeof document === 'undefined') return
  const activeLanguage = languageOptions.has(language) ? language : 'fa'
  document.documentElement.lang = activeLanguage
  document.documentElement.dir = activeLanguage === 'fa' ? 'rtl' : 'ltr'
  document.title = activeLanguage === 'fa'
    ? 'راه | همراه شما در شهر'
    : 'RAH | Your companion around town'

  const description = document.querySelector('meta[name="description"]')
  if (description) {
    description.content = activeLanguage === 'fa'
      ? 'راه؛ همراه شما برای مسیرهای روزمره، سفرها و جابه‌جایی‌های شهری.'
      : 'RAH is your companion for everyday routes, trips, and city travel.'
  }
}

const languageOptions = new Set(['fa', 'en'])
syncDocumentLanguage(i18n.language)
i18n.on('languageChanged', syncDocumentLanguage)

export default i18n
