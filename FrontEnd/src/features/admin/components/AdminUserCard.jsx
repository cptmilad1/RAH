import { Link } from 'react-router-dom'
import Card from '../../../global/Card'

const roleLabels = { user: 'کاربر', admin: 'مدیر', driver: 'راننده' }
const applicationStatusLabels = { pending: 'در انتظار بررسی', approved: 'تأییدشده', rejected: 'ردشده', suspended: 'معلق' }
const dateFormatter = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })
const actionClass = 'min-h-10 rounded-xl px-4 text-xs font-extrabold disabled:cursor-wait disabled:opacity-60'
const driverDetails = [
  ['ولایت کاری', (user) => user.driverProvince || '—'],
  ['جواز رانندگی', (user) => user.licenseNumber || '—'],
  ['اعتبار جواز', (user) => user.licenseExpiry ? dateFormatter.format(new Date(user.licenseExpiry)) : '—'],
  ['موتر', (user) => [user.vehicleMake, user.vehicleModel, user.vehicleYear, user.vehicleColor].filter(Boolean).join(' · ') || '—'],
  ['نمبر پلیت', (user) => user.plateNumber || '—'],
]

function getUserActions({ user, updating, isCurrentUser, onSetRole, onApprove, onReject, onSetActive }) {
  const pending = user.driverStatus === 'pending'
  const activeMessage = user.isActive
    ? `حساب «${user.fullName}» غیرفعال شود؟ نشست‌های فعال او نیز بسته می‌شوند.`
    : `حساب «${user.fullName}» فعال شود؟`
  return [
    pending && { label: updating ? 'در حال ثبت…' : 'تأیید راننده', onClick: () => onApprove(user.id), className: 'bg-[#174c3c] text-white' },
    pending && { label: 'رد درخواست', onClick: () => window.confirm(`درخواست رانندگی «${user.fullName}» رد شود؟`) && onReject(user.id), className: 'border border-[#f0d7d0] bg-white text-[#a94f3d]' },
    !pending && user.role === 'user' && { label: 'تبدیل به مدیر', onClick: () => onSetRole(user.id, 'admin'), className: 'border border-[#d6e5dc] bg-white text-[#315946]' },
    !pending && user.role === 'admin' && !isCurrentUser && { label: 'گرفتن دسترسی مدیر', onClick: () => onSetRole(user.id, 'user'), className: 'border border-[#d6e5dc] bg-white text-[#315946]' },
    !isCurrentUser && {
      label: user.isActive ? 'غیرفعال‌کردن حساب' : 'فعال‌کردن حساب',
      onClick: () => window.confirm(activeMessage) && onSetActive(user.id, !user.isActive),
      className: user.isActive ? 'border border-[#f0d7d0] bg-white text-[#a94f3d]' : 'border border-[#d5e8ce] bg-[#f3f8ed] text-[#416d43]',
    },
  ].filter(Boolean).map((action) => ({ ...action, disabled: updating }))
}

function AdminUserCard({
  user,
  updating,
  isCurrentUser,
  onSetRole,
  onApprove,
  onReject,
  onSetActive,
}) {
  const pendingDriver = user.driverStatus === 'pending'
  const location = user.driverProvince || user.city || user.address || 'ثبت نشده'
  const recordDate = user.driverAppliedAt || user.createdAt
  const badges = [
    { visible: !user.isActive, label: 'حساب غیرفعال', className: 'bg-[#fae9e4] text-[#a85848]' },
    user.driverStatus && {
      visible: true,
      label: `درخواست رانندگی: ${applicationStatusLabels[user.driverStatus] || user.driverStatus}`,
      className: pendingDriver ? 'bg-[#fbf6df] text-[#897c3e]' : 'bg-[#f0f4eb] text-[#547460]',
    },
  ].filter(Boolean).filter((badge) => badge.visible)
  const actions = getUserActions({ user, updating, isCurrentUser, onSetRole, onApprove, onReject, onSetActive })

  return (
    <Card as="article" variant="unstyled" className={`rounded-2xl border p-4 transition sm:p-5 ${user.isActive ? 'border-[#e8ede5] bg-white' : 'border-[#f0d7d0] bg-[#fffaf8]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/profile/${user.id}`} className="text-sm font-extrabold text-[#264538] no-underline hover:text-[#668744]">{user.fullName || 'بدون نام'}</Link>
            <span className="rounded-full bg-[#f0f4eb] px-2.5 py-1 text-[10px] font-bold text-[#547460]">{roleLabels[user.role] || user.role}</span>
            {badges.map((badge) => <span key={badge.label} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>)}
          </div>
          <p className="mb-0 mt-2 truncate text-xs text-[#829188]">{user.email} · {user.username ? `@${user.username} · ` : ''}{user.phone || 'بدون شماره'}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#829188]">
            <span>شهر / ولایت: {location}</span>
            <span>{user.driverStatus ? 'تاریخ درخواست' : 'تاریخ عضویت'}: {dateFormatter.format(new Date(recordDate || user.createdAt))}</span>
            <span>ایمیل: {user.isVerify ? 'تأییدشده' : 'تأییدنشده'}</span>
          </div>
          {user.driverStatus && <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-[#547460]">مشاهدهٔ مشخصات جواز و موتر</summary>
            <div className="mt-3 grid gap-2 rounded-xl bg-[#f7f9f4] p-3 text-xs text-[#65756b] sm:grid-cols-2">
              {driverDetails.map(([label, getValue]) => <span key={label}>{label}: {getValue(user)}</span>)}
            </div>
          </details>}
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => <button key={action.label} type="button" disabled={action.disabled} onClick={action.onClick} className={`${actionClass} ${action.className}`}>{action.label}</button>)}
        </div>
      </div>
    </Card>
  )
}

export default AdminUserCard
