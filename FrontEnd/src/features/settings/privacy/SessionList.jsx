import { localizeText } from '../locals/localizedText.js'
import { useTranslation } from 'react-i18next'

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function SessionList({ sessions, onLogout, loading, error, onRefresh, isRemovingSession }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--settings-line)] px-4 py-6 text-center text-sm text-[var(--settings-muted)]">
        {localizeText(t('settings.privacySection.sessions.loading'))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="m-0">{localizeText(error)}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-semibold text-red-700"
        >
          {localizeText(t('settings.privacySection.sessions.retry'))}
        </button>
      </div>
    )
  }

  if (!sessions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--settings-line)] px-4 py-6 text-center text-sm text-[var(--settings-muted)]">
        {localizeText(t('settings.privacySection.sessions.empty'))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <article
          key={session.id}
          className="rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-surface)] p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="m-0 text-sm font-bold text-[var(--settings-ink)]">
                {localizeText(session.device || t('settings.privacySection.sessions.unknownDevice'))}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--settings-muted)]">
                <span>{localizeText(t('settings.privacySection.sessions.ip'))}: {localizeText(session.ip_address || '—')}</span>
                <span>{localizeText(t('settings.privacySection.sessions.createdAt'))}: {localizeText(formatDate(session.created_at))}</span>
                <span>{localizeText(t('settings.privacySection.sessions.expiresAt'))}: {localizeText(formatDate(session.expires_at))}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onLogout(session.id)}
              disabled={isRemovingSession === session.id}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {localizeText(isRemovingSession === session.id ? t('settings.privacySection.sessions.loggingOut') : t('settings.privacySection.sessions.logout'))}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default SessionList
