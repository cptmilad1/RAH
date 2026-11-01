import { Link } from "react-router-dom"
const actionBaseClass = 'flex min-h-[72px] items-center justify-between rounded-[17px] px-5 text-right text-sm font-extrabold shadow-[0_8px_24px_rgba(22,57,43,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,57,43,0.12)]'

function DashboardActionCard({ to, onClick, icon, label, variant = 'default' }) {
  const Element = to ? Link : 'button'
  const variants = {
    default: 'border border-[#d6e5dc] bg-white text-[#193e31]',
    highlight: 'border border-[#d9eaa3] bg-gradient-to-l from-[#e5f5b3] to-[#d8ef83] text-[#193e31]',
    dark: 'bg-gradient-to-l from-[#1c5942] to-[#174735] text-white shadow-[0_8px_24px_rgba(22,57,43,0.1)] hover:shadow-[0_14px_30px_rgba(22,57,43,0.18)]',
  }
  return (
    <Element
      {...(to ? { to } : { type: 'button', onClick })}
      className={`${actionBaseClass} ${to ? 'no-underline' : ''} ${variants[variant]}`}
    >
      <span className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl text-lg ${variant === 'dark' ? 'bg-white/10 text-[#d7f36a]' : 'bg-white/60'}`} aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className={`text-xl ${variant === 'dark' ? 'text-[#d7f36a]' : ''}`} aria-hidden="true">←</span>
    </Element>
  )
}
export default DashboardActionCard