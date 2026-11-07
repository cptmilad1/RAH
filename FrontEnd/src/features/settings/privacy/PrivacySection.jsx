import i18n from '../locals/i18n.js'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ChangePasswordForm from './ChangePasswordForm'
import SessionList from './SessionList'
import { getSessions, logoutAllSessions, logoutSession } from './privacyApi'

function PrivacySection() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('activity')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [isRemovingSession, setIsRemovingSession] = useState(null)

  const refreshSessions = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getSessions()
      setSessions(Array.isArray(result.data) ? result.data : [])
    } catch (loadError) {
      setError(loadError.message || t('settings.privacySection.sessions.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (activeTab !== 'activity') return undefined

    let isCurrent = true
    getSessions()
      .then((result) => {
        if (!isCurrent) return
        setSessions(Array.isArray(result.data) ? result.data : [])
        setError('')
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError.message || t('settings.privacySection.sessions.loadError'))
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [activeTab, t])

  const handleTabChange = (tab) => {
    if (tab === 'activity') setLoading(true)
    setActiveTab(tab)
  }

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true)

    try {
      await logoutAllSessions()
      await refreshSessions()
    } catch (logoutError) {
      setError(logoutError.message || t('settings.privacySection.sessions.logoutAllError'))
    } finally {
      setIsLoggingOutAll(false)
    }
  }

  const handleLogoutSession = async (sessionId) => {
    setIsRemovingSession(sessionId)

    try {
      await logoutSession(sessionId)
      await refreshSessions()
    } catch (logoutError) {
      setError(logoutError.message || t('settings.privacySection.sessions.logoutError'))
    } finally {
      setIsRemovingSession(null)
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-surface)] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-extrabold text-[var(--settings-ink)]">{t('settings.privacy')}</h2>
        <p className="mb-0 mt-1 text-sm leading-6 text-[var(--settings-muted)]">{t('settings.privacySection.description')}</p>
      </div>

      <div role="tablist" aria-label={t('settings.privacy')} className="mb-5 flex gap-2 border-b border-[var(--settings-line)]">
        {['activity', 'password'].map((tab) => (
          <button
            key={tab}
            id={`privacy-tab-${tab}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`privacy-panel-${tab}`}
            onClick={() => handleTabChange(tab)}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
              activeTab === tab
                ? 'border-[var(--settings-accent)] text-[var(--settings-ink)]'
                : 'border-transparent text-[var(--settings-muted)] hover:text-[var(--settings-ink)]'
            }`}
          >
            {t(`settings.privacySection.tabs.${tab}`)}
          </button>
        ))}
      </div>

      <div
        id="privacy-panel-activity"
        role="tabpanel"
        aria-labelledby="privacy-tab-activity"
        hidden={activeTab !== 'activity'}
        className="space-y-4"
      >
        <div className="space-y-4 rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-background)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="m-0 text-base font-bold text-[var(--settings-ink)]">{t('settings.privacySection.sessions.title')}</h3>
              <p className="mb-0 mt-1 text-sm text-[var(--settings-muted)]">{t('settings.privacySection.sessions.description')}</p>
            </div>

            <button
              type="button"
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {i18n.t(isLoggingOutAll ? t('settings.privacySection.sessions.loggingOutAll') : t('settings.privacySection.sessions.logoutAll'))}
            </button>
          </div>

          <SessionList
            sessions={sessions}
            onLogout={handleLogoutSession}
            loading={loading}
            error={i18n.t(error)}
            onRefresh={refreshSessions}
            isRemovingSession={isRemovingSession}
          />
        </div>
      </div>

      <div
        id="privacy-panel-password"
        role="tabpanel"
        aria-labelledby="privacy-tab-password"
        hidden={activeTab !== 'password'}
        className="space-y-4"
      >
        <h3 className="m-0 text-base font-bold text-[var(--settings-ink)]">{t('settings.privacySection.password.title')}</h3>
        <ChangePasswordForm />
      </div>
    </section>
  )
}

export default PrivacySection
