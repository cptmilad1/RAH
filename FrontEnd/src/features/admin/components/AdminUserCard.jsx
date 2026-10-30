import { Link } from 'react-router-dom'

const roleLabels = { user: 'کاربر', admin: 'مدیر', driver: 'راننده' }
const applicationStatusLabels = { pending: 'در انتظار بررسی', approved: 'تأییدشده', rejected: 'ردشده', suspended: 'معلق' }
const dateFormatter = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })

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
  const vehicle = [user.vehicleMake, user.vehicleModel, user.vehicleYear, user.vehicleColor]
    .filter(Boolean)
    .join(' · ')

  function rejectApplication() {
    if (window.confirm(`درخواست رانندگی «${user.fullName}» رد شود؟`)) {
      onReject(user.id)
    }
  }

  function changeAccountStatus() {
    const nextStatus = !user.isActive
    const message = nextStatus
      ? `حساب «${user.fullName}» فعال شود؟`
      : `حساب «${user.fullName}» غیرفعال شود؟ نشست‌های فعال او نیز بسته می‌شوند.`
    if (window.confirm(message)) onSetActive(user.id, nextStatus)
  }

  return (
    <article className={`rounded-2xl border p-4 transition sm:p-5 ${user.isActive ? 'border-[#e8ede5] bg-white' : 'border-[#f0d7d0] bg-[#fffaf8]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/profile/${user.id}`} className="text-sm font-extrabold text-[#264538] no-underline hover:text-[#668744]">{user.fullName || 'بدون نام'}</Link>
            <span className="rounded-full bg-[#f0f4eb] px-2.5 py-1 text-[10px] font-bold text-[#547460]">{roleLabels[user.role] || user.role}</span>
            {!user.isActive && <span className="rounded-full bg-[#fae9e4] px-2.5 py-1 text-[10px] font-bold text-[#a85848]">حساب غیرفعال</span>}
            {user.driverStatus && <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${pendingDriver ? 'bg-[#fbf6df] text-[#897c3e]' : 'bg-[#f0f4eb] text-[#547460]'}`}>
              درخواست رانندگی: {applicationStatusLabels[user.driverStatus] || user.driverStatus}
            </span>}
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
              <span>ولایت کاری: {user.driverProvince || '—'}</span>
              <span>جواز رانندگی: {user.licenseNumber || '—'}</span>
              <span>اعتبار جواز: {user.licenseExpiry ? dateFormatter.format(new Date(user.licenseExpiry)) : '—'}</span>
              <span>موتر: {vehicle || '—'}</span>
              <span>نمبر پلیت: {user.plateNumber || '—'}</span>
            </div>
          </details>}
        </div>

        <div className="flex flex-wrap gap-2">
          {pendingDriver && <>
            <button type="button" disabled={updating} onClick={() => onApprove(user.id)} className="min-h-10 rounded-xl bg-[#174c3c] px-4 text-xs font-extrabold text-white disabled:cursor-wait disabled:opacity-60">
              {updating ? 'در حال ثبت…' : 'تأیید راننده'}
            </button>
            <button type="button" disabled={updating} onClick={rejectApplication} className="min-h-10 rounded-xl border border-[#f0d7d0] bg-white px-4 text-xs font-extrabold text-[#a94f3d] disabled:cursor-wait disabled:opacity-60">رد درخواست</button>
          </>}
          {user.role === 'user' && !pendingDriver && <button type="button" disabled={updating} onClick={() => onSetRole(user.id, 'admin')} className="min-h-10 rounded-xl border border-[#d6e5dc] bg-white px-4 text-xs font-extrabold text-[#315946] disabled:cursor-wait disabled:opacity-60">تبدیل به مدیر</button>}
          {user.role === 'admin' && !isCurrentUser && <button type="button" disabled={updating} onClick={() => onSetRole(user.id, 'user')} className="min-h-10 rounded-xl border border-[#d6e5dc] bg-white px-4 text-xs font-extrabold text-[#315946] disabled:cursor-wait disabled:opacity-60">گرفتن دسترسی مدیر</button>}
          {!isCurrentUser && <button type="button" disabled={updating} onClick={changeAccountStatus} className={`min-h-10 rounded-xl border px-4 text-xs font-extrabold disabled:cursor-wait disabled:opacity-60 ${user.isActive ? 'border-[#f0d7d0] bg-white text-[#a94f3d]' : 'border-[#d5e8ce] bg-[#f3f8ed] text-[#416d43]'}`}>
            {user.isActive ? 'غیرفعال‌کردن حساب' : 'فعال‌کردن حساب'}
          </button>}
        </div>
      </div>
    </article>
  )
}

export default AdminUserCard
