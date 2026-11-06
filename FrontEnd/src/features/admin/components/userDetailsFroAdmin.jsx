import { localizeText } from '../../settings/locals/localizedText.js'
import UserProfileLink from "../../../global/UserProfileLink"

function UserDetailsForAdmin({ user, recordDate , location, badges, roleLabels, dateFormatter, driverDetails }) {
    return (
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <UserProfileLink userId={user.id} name={user.fullName || 'بدون نام'} image={user.image} imageClassName="size-9" nameClassName="text-sm font-extrabold text-[#264538] hover:text-[#668744]" />
            <span className="rounded-full bg-[#f0f4eb] px-2.5 py-1 text-[10px] font-bold text-[#547460]">{localizeText(roleLabels[user.role] || user.role)}</span>
            {badges.map((badge) => <span key={badge.label} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badge.className}`}>{localizeText(badge.label)}</span>)}
          </div>
          <p className="mb-0 mt-2 truncate text-xs text-[#829188]">{localizeText(user.email)} · {localizeText(user.username ? `@${user.username} · ` : '')}{localizeText(user.phone || 'بدون شماره')}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#829188]">
            <span>{localizeText("شهر / ولایت:")}{' '}{localizeText(location)}</span>
            <span>{localizeText(user.driverStatus ? 'تاریخ درخواست' : 'تاریخ عضویت')}: {localizeText(dateFormatter.format(new Date(recordDate || user.createdAt)))}</span>
            <span>{localizeText("ایمیل:")}{' '}{localizeText(user.isVerify ? 'تأییدشده' : 'تأییدنشده')}</span>
          </div>
          {user.driverStatus && <details className="mt-3">
            <summary className="cursor-pointer text-xs font-bold text-[#547460]">{localizeText("مشاهدهٔ مشخصات جواز و موتر")}</summary>
            <div className="mt-3 grid gap-2 rounded-xl bg-[#f7f9f4] p-3 text-xs text-[#65756b] sm:grid-cols-2">
              {driverDetails.map(([label, getValue]) => <span key={label}>{localizeText(label)}: {localizeText(getValue(user))}</span>)}
            </div>
          </details>}
        </div>
    )
}
export default UserDetailsForAdmin