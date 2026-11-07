import i18n from '../locals/i18n.js'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changePassword } from './privacyApi'

const initialState = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function ChangePasswordForm() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialState)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState({ type: 'idle', message: '' })

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    if (!form.oldPassword.trim() || !form.newPassword.trim() || !form.confirmPassword.trim()) {
      setNotice({ type: 'error', message: t('settings.privacySection.form.validation.required') })
      return
    }

    if (form.newPassword.length < 8) {
      setNotice({ type: 'error', message: t('settings.privacySection.form.validation.length') })
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setNotice({ type: 'error', message: t('settings.privacySection.form.validation.match') })
      return
    }

    setBusy(true)
    setNotice({ type: 'idle', message: '' })

    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })

      setForm(initialState)
      setNotice({ type: 'success', message: t('settings.privacySection.form.success') })
    } catch (error) {
      setNotice({ type: 'error', message: error.message || t('settings.privacySection.form.failure') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-background)] p-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--settings-ink)]">
          {t('settings.privacySection.form.oldPassword')}
        </label>
        <input
          type="password"
          value={form.oldPassword}
          onChange={updateField('oldPassword')}
          autoComplete="current-password"
          className="w-full rounded-xl border border-[var(--settings-line)] bg-[var(--settings-surface)] px-3 py-2.5 text-sm text-[var(--settings-ink)] outline-none transition focus:border-[var(--settings-accent)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--settings-ink)]">
            {t('settings.privacySection.form.newPassword')}
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={updateField('newPassword')}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--settings-line)] bg-[var(--settings-surface)] px-3 py-2.5 text-sm text-[var(--settings-ink)] outline-none transition focus:border-[var(--settings-accent)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--settings-ink)]">
            {t('settings.privacySection.form.confirmPassword')}
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[var(--settings-line)] bg-[var(--settings-surface)] px-3 py-2.5 text-sm text-[var(--settings-ink)] outline-none transition focus:border-[var(--settings-accent)]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-[var(--settings-accent)] px-4 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {i18n.t(busy ? t('settings.privacySection.form.saving') : t('settings.privacySection.form.submit'))}
        </button>

        {notice.message && (
          <p className={`m-0 text-xs ${notice.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {i18n.t(notice.message)}
          </p>
        )}
      </div>
    </form>
  )
}

export default ChangePasswordForm
