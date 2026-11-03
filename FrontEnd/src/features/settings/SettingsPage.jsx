import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useSettingsStore } from './settingsStore'
import {
  colorOptions,
  fontOptions,
  languageOptions,
  themeOptions,
} from './settingsOptions'
import './i18n'

const fontFamilies = {
  vazirmatn: '"Vazirmatn", Tahoma, Arial, sans-serif',
  tahoma: 'Tahoma, Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  system: 'system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
}

const colorSwatches = {
  forest: ['#174c3c', '#d7f36a'],
  ocean: ['#155e75', '#67e8f9'],
  violet: ['#5b3b91', '#c4b5fd'],
  sunset: ['#9a3412', '#fdba74'],
  monochrome: ['#30343b', '#cbd5e1'],
}

function OptionButton({ active, children, onClick, style, ariaLabel }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
      style={style}
      className={`min-h-[54px] rounded-xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
        active
          ? 'border-[var(--settings-accent)] bg-[var(--settings-accent-soft)] text-[var(--settings-ink)] shadow-sm'
          : 'border-[var(--settings-line)] bg-[var(--settings-surface)] text-[var(--settings-ink)] hover:border-[var(--settings-accent)]'
      }`}
    >
      {children}
    </button>
  )
}

function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-surface)] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-extrabold text-[var(--settings-ink)]">{title}</h2>
        {description && <p className="mb-0 mt-1 text-sm leading-6 text-[var(--settings-muted)]">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function SettingsPage() {
  const { t } = useTranslation()
  const { theme, font, language, color, syncStatus, setPreference } = useSettingsStore()

  const changeLanguage = async (nextLanguage) => {
    await setPreference('language', nextLanguage)
  }

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
          <SettingsSection title={t('settings.appearance')} description={t('settings.appearanceDescription')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={theme === option}
                  onClick={() => setPreference('theme', option)}
                >
                  {t(`settings.themes.${option}`)}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.fonts')} description={t('settings.fontsDescription')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fontOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={font === option}
                  onClick={() => setPreference('font', option)}
                  style={{ fontFamily: fontFamilies[option] }}
                >
                  {t(`settings.fontsList.${option}`)}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.privacy')}>
            <div className="rounded-xl border border-dashed border-[var(--settings-line)] px-4 py-6 text-center text-sm text-[var(--settings-muted)]">
              {t('settings.privacyEmpty')}
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.language')} description={t('settings.languageDescription')}>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={language === option}
                  onClick={() => changeLanguage(option)}
                >
                  {t(`settings.languages.${option}`)}
                </OptionButton>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.colors')} description={t('settings.colorsDescription')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colorOptions.map((option) => (
                <OptionButton
                  key={option}
                  active={color === option}
                  ariaLabel={t(`settings.colorsList.${option}`)}
                  onClick={() => setPreference('color', option)}
                >
                  <span className="flex items-center justify-between gap-3">
                    {t(`settings.colorsList.${option}`)}
                    <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                      {colorSwatches[option].map((swatch) => (
                        <span
                          key={swatch}
                          className="size-5 rounded-full border-2 border-[var(--settings-surface)]"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </span>
                  </span>
                </OptionButton>
              ))}
            </div>
          </SettingsSection>
        </div>
        <p role="status" aria-live="polite" className={`mb-0 mt-5 text-center text-xs ${syncStatus === 'error' ? 'text-red-600' : 'text-[var(--settings-muted)]'}`}>
          {syncStatus === 'error' ? t('settings.saveError') : syncStatus === 'saved' ? t('settings.saved') : t('settings.saving')}
        </p>
      </div>
    </main>
  )
}

export default SettingsPage
