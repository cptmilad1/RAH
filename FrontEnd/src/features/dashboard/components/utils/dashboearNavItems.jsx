import { Link } from 'react-router-dom'
const navBaseClass = 'flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]'
const navIconClass = 'grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]'

function DashboardNavItem({ to, onClick, icon, label, active = false, unread = false }) {
  const Element = to ? Link : 'button'
  return (
    <Element
      {...(to ? { to } : { type: 'button', onClick })}
      className={`${navBaseClass} ${to ? 'no-underline' : ''} ${active
        ? 'bg-[#d7f36a]/[0.13] font-extrabold text-[#e7f5b5]'
        : 'font-semibold text-[#b8c9c0]'}`}
    >
      <span className={`${navIconClass} ${active ? 'text-[#d7f36a]' : ''}`} aria-hidden="true">{icon}</span>
      <span className="flex items-center gap-2">
        {label}
        {unread && <span className="size-2 rounded-full bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.16)]" aria-label="پیام خوانده‌نشده" />}
      </span>
    </Element>
  )
}
export default DashboardNavItem