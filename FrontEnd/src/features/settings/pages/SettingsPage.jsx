import i18n from '../locals/i18n.js'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import PrivacySection from '../privacy/PrivacySection'
import { useSettingsStore } from '../hooks/settingsStore'
import Themes from '../components/themes'
import Fonts from '../components/fonts'
import SelectLang from '../components/language'
import Colors from '../components/colors'
import '../locals/i18n'


function SettingsPage() {
  const { t } = useTranslation()
  const { syncStatus, setPreference } = useSettingsStore()
  return (
    <main className="min-h-screen bg-[var(--settings-background)] px-4 py-7 text-[var(--settings-ink)] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black sm:text-3xl">{t('settings.title')}</h1>
            <p className="mb-0 mt-2 text-sm leading-6 text-[var(--settings-muted)]">{t('settings.subtitle')}</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl border border-[var(--settings-line)] bg-[var(--settings-surface)] px-4 py-2.5 text-sm font-bold text-[var(--settings-ink)] no-underline transition hover:border-[var(--settings-accent)]"
          >
            {t('settings.back')}
          </Link>
        </header>

        <div className="grid gap-4">
          <Themes setPreference={setPreference}/>
          <Fonts setPreference={setPreference}/>
          <PrivacySection />
          <SelectLang setPreference={setPreference}/>
          <Colors setPreference={setPreference}/>
        </div>
        <p role="status" aria-live="polite" className={`mb-0 mt-5 text-center text-xs ${syncStatus === 'error' ? 'text-red-600' : 'text-[var(--settings-muted)]'}`}>
          {i18n.t(syncStatus === 'error' ? t('settings.saveError') : syncStatus === 'saved' ? t('settings.saved') : t('settings.saving'))}
        </p>
      </div>
    </main>
  )
}

export default SettingsPage
