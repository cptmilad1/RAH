import i18n from '../../../settings/locals/i18n.js'
import { NavLink } from 'react-router-dom'
const navBaseClass = 'dashboard-nav-item flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] border px-3 py-2.5 text-[11px] transition duration-200 lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]'
const navIconClass = 'dashboard-nav-icon grid mb-1.5 size-[19px] place-items-center rounded-lg text-[18px] lg:size-[23px] lg:text-[17px]'

function DashboardNavItem({ to, onClick, icon, label, active = false, unread = false }) {
  const content = () => (
    <div className='flex justify-center items-center gap-2'>
      <span className={`${navIconClass}`} aria-hidden="true">{icon}</span>
      <span className="flex items-center gap-2">
        {i18n.t(label)}
        {unread && <span className="size-2 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.16)]" aria-label={i18n.t("پیام خوانده‌نشده")} />}
      </span>
    </div>
  )
  const className = (isCurrent) => `${navBaseClass} ${to ? 'no-underline' : ''} ${isCurrent ? 'is-active font-extrabold shadow-[0_8px_24px_rgba(5,24,17,0.16)]' : 'font-semibold'}`

  if (to) {
    return (
      <NavLink to={to} className={({ isActive }) => className(isActive)}>
        {content()}
      </NavLink>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className(active)}>
      {content()}
    </button>
  )
}
export default DashboardNavItem