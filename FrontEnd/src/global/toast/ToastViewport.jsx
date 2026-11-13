import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { dismissToast, useToastStore } from './toastStore'

const icons = {
  success: '✓',
  error: '×',
  info: 'i',
  warning: '!',
}

const toastStyles = {
  success: '[--toast-accent:#27854a]',
  error: '[--toast-accent:#c44e43]',
  info: '[--toast-accent:var(--app-brand)]',
  warning: '[--toast-accent:#c17a21]',
}

function ToastItem({ item, t }) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(item.id), item.duration)
    return () => window.clearTimeout(timer)
  }, [item.id, item.duration])

  return (
    <article
      className={`relative grid min-h-[4.25rem] grid-cols-[2.25rem_minmax(0,1fr)_1.75rem] items-center gap-3 overflow-hidden rounded-2xl border border-[var(--app-line)] border-s-[3px] border-s-[var(--toast-accent)] bg-[color-mix(in_srgb,var(--app-surface)_94%,transparent)] p-[0.85rem_0.9rem] text-[var(--app-ink)] shadow-[0_16px_42px_rgb(16_38_29_/_16%),0_3px_10px_rgb(16_38_29_/_6%)] backdrop-blur-[18px] [animation:rah-toast-enter_260ms_cubic-bezier(.2,.8,.2,1)_both] pointer-events-auto ${toastStyles[item.type] || toastStyles.info}`}
      role={item.type === 'error' ? 'alert' : 'status'}
      style={{ '--toast-duration': `${item.duration}ms` }}
    >
      <span className="grid size-[2.15rem] place-items-center rounded-xl bg-[color-mix(in_srgb,var(--toast-accent)_12%,var(--app-surface))] text-[length:1rem] font-extrabold text-[var(--toast-accent)]" aria-hidden="true">{icons[item.type]}</span>
      <p className="m-0 wrap-anywhere text-[length:0.82rem] font-[650] leading-[1.7] text-[var(--app-ink)]">{t(item.message, item.values)}</p>
      <button
        type="button"
        className="grid size-7 place-items-center rounded-[0.55rem] border-0 bg-transparent text-[length:1.2rem] leading-none text-[var(--app-muted)] transition-[background-color,color] duration-[150ms] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-ink)]"
        onClick={() => dismissToast(item.id)}
        aria-label={t('toast.dismiss')}
      >
        <span aria-hidden="true">×</span>
      </button>
      <span className="col-span-full mt-2 h-[2px] w-full origin-left bg-[var(--toast-accent)] opacity-60 [animation:rah-toast-countdown_var(--toast-duration)_linear_both] rtl:origin-right" aria-hidden="true" />
    </article>
  )
}

function ToastViewport() {
  const { t } = useTranslation()
  const toasts = useToastStore((state) => state.toasts)

  return (
    <div className="pointer-events-none fixed left-1/2 right-auto top-0 z-[1000] grid w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 gap-[0.7rem]" aria-label={t('toast.notifications')}>
      {toasts.map((item) => <ToastItem key={item.id} item={item} t={t} />)}
    </div>
  )
}

export default ToastViewport
