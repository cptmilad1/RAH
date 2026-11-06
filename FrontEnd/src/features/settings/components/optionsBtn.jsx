import i18n from '../locals/i18n.js'
function OptionButton({ active, children, onClick, style, ariaLabel }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={i18n.t(ariaLabel)}
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
export default OptionButton