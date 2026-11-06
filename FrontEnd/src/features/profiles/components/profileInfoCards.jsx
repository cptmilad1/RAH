import { localizeText } from '../../settings/locals/localizedText.js'
import InfoCard from '../../../global/InfoCard'
import formatDate from '../utils/formatData'

function ProfileInfoCards({ users, roleLabel }) {
    return (
        <section aria-labelledby="profile-details-title" className="mt-6 sm:mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="mb-1.5 text-[10px] font-bold text-[#829087]">{localizeText("حساب کاربری")}</p>
                    <h2 id="profile-details-title" className="m-0 text-lg font-extrabold text-[#1a3d32] sm:text-xl">{localizeText("جزئیات پروفایل")}</h2>
                </div>
                <span className="text-[10px] text-[#8a9991]">{localizeText("اطلاعات ثبت‌شده")}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <InfoCard data-profile-card title={localizeText("شناسه حساب")} value={localizeText(users?.id)} icon="#" dir="ltr" />
                <InfoCard data-profile-card title={localizeText("نام کاربری")} value={localizeText(users?.username)} icon="@" dir="ltr" />
                <InfoCard data-profile-card title={localizeText("نشانی ایمیل")} value={localizeText(users?.email)} icon="✉" dir="ltr" />
                <InfoCard data-profile-card title={localizeText("شماره تماس")} value={localizeText(users?.phone)} icon="☎" dir="ltr" />
                <InfoCard data-profile-card title={localizeText("نوع حساب")} value={localizeText(roleLabel)} icon="✦" />
                <InfoCard data-profile-card title={localizeText("تأیید ایمیل")} value={localizeText(users?.verify == null ? 'نامشخص' : users.verify ? 'تأیید شده' : 'در انتظار تأیید')} icon="✓" tone={users?.verify ? 'success' : 'warning'} />
                <InfoCard data-profile-card title={localizeText("وضعیت حساب")} value={localizeText(users?.isActive == null ? 'نامشخص' : users.isActive ? 'فعال' : 'غیرفعال')} icon="◉" tone={users?.isActive ? 'success' : 'warning'} />
                <InfoCard data-profile-card title={localizeText("تاریخ عضویت")} value={localizeText(formatDate(users?.signUp_At))} icon="◷" />
                <InfoCard data-profile-card title={localizeText("نشانی")} value={localizeText(users?.address)} icon="⌖" />
            </div>
        </section>
    )
}
export default ProfileInfoCards