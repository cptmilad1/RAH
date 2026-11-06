import i18n from '../../settings/locals/i18n.js'
import UserProfileLink from "../../../global/UserProfileLink"

function UserDetailsForAdmin({ user, recordDate , location, badges, roleLabels, dateFormatter, driverDetails }) {
    return (
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UserProfileLink userId={user.id} name={user.fullName || 'بدون نام'} image={user.image} imageClassName="size-9" nameClassName="text-sm font-extrabold text-[#264538] hover:text-[#668744]" />
            <span className="rounded-full bg-[#f0f4eb] px-2.5 py-1 text-[10px] font-bold text-[#547460]">{i18n.t(roleLabels[user.role] || user.role)}</span>
            {badges.map((badge) => <span key={badge.label} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>{i18n.t(badge.label)}</span>)}
          </div>
          <p className="mb-0 mt-2 truncate text-xs text-[#829188]">{user.email} · {user.username ? `@${user.username} · ` : ''}{user.phone || i18n.t('بدون شماره')}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#829188]">
            <span>{i18n.t("شهر / ولایت:")}{' '}{location}</span>
            <span>{i18n.t(user.driverStatus ? 'تاریخ درخواست' : 'تاریخ عضویت')}: {dateFormatter.format(new Date(recordDate || user.createdAt))}</span>
            <span>{i18n.t("ایمیل:")}{' '}{i18n.t(user.isVerify ? 'تأییدشده' : 'تأییدنشده')}</span>
          </div>
          {user.driverStatus && <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-[#547460]">{i18n.t("مشاهدهٔ مشخصات جواز و موتر")}</summary>
            <div className="mt-3 grid gap-2 rounded-xl bg-[#f7f9f4] p-3 text-xs text-[#65756b] sm:grid-cols-2">
              {driverDetails.map(([label, getValue]) => <span key={label}>{i18n.t(label)}: {getValue(user)}</span>)}
            </div>
          </details>}
        </div>
    )
}
export default UserDetailsForAdmin