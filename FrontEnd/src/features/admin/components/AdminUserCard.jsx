import Card from '../../../global/Card'
import UserDetailsForAdmin from './userDetailsFroAdmin'
import DriverDetails from './utils/driverDetails'
import DeactiveUser from './deActiveUser'

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
  const driverDetails = DriverDetails(user, dateFormatter)
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

  return (
    <Card as="article" variant="unstyled" className={`rounded-2xl border p-4 transition sm:p-5 ${user.isActive ? 'border-[#e8ede5] bg-white' : 'border-[#f0d7d0] bg-[#fffaf8]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <UserDetailsForAdmin user={user} recordDate={recordDate} location={location} badges={badges} roleLabels={roleLabels} dateFormatter={dateFormatter} driverDetails={driverDetails} />
        <DeactiveUser user={user} updating={updating} isCurrentUser={isCurrentUser} onSetRole={onSetRole} onApprove={onApprove} onReject={onReject} onSetActive={onSetActive} />
      </div>
    </Card>
  )
}

export default AdminUserCard
