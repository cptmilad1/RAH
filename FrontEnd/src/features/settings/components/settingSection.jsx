import { localizeText } from '../locals/localizedText.js'
function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-[var(--settings-line)] bg-[var(--settings-surface)] p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-extrabold text-[var(--settings-ink)]">{localizeText(title)}</h2>
        {description && <p className="mb-0 mt-1 text-sm leading-6 text-[var(--settings-muted)]">{localizeText(description)}</p>}
      </div>
      {localizeText(children)}
    </section>
  )
}
export default SettingsSection