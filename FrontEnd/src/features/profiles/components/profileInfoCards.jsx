import i18n from '../../settings/locals/i18n.js'
import InfoCard from '../../../global/InfoCard'
import formatDate from '../utils/formatData'

function ProfileInfoCards({ users, roleLabel }) {
    return (
        <section aria-labelledby="profile-details-title" className="mt-6 sm:mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="mb-1.5 text-[10px] font-bold text-[#829087]">{i18n.t("حساب کاربری")}</p>
                    <h2 id="profile-details-title" className="m-0 text-lg font-extrabold text-[#1a3d32] sm:text-xl">{i18n.t("جزئیات پروفایل")}</h2>
                </div>
                <span className="text-[10px] text-[#8a9991]">{i18n.t("اطلاعات ثبت‌شده")}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <InfoCard data-profile-card title={i18n.t("شناسه حساب")} value={users?.id} icon="#" dir="ltr" />
                <InfoCard data-profile-card title={i18n.t("نام کاربری")} value={users?.username} icon="@" dir="ltr" />
                <InfoCard data-profile-card title={i18n.t("نشانی ایمیل")} value={users?.email} icon="✉" dir="ltr" />
                <InfoCard data-profile-card title={i18n.t("شماره تماس")} value={users?.phone} icon="☎" dir="ltr" />
                <InfoCard data-profile-card title={i18n.t("نوع حساب")} value={i18n.t(roleLabel)} icon="✦" />
                <InfoCard data-profile-card title={i18n.t("تأیید ایمیل")} value={i18n.t(users?.verify == null ? 'نامشخص' : users.verify ? 'تأیید شده' : 'در انتظار تأیید')} icon="✓" tone={users?.verify ? 'success' : 'warning'} />
                <InfoCard data-profile-card title={i18n.t("وضعیت حساب")} value={i18n.t(users?.isActive == null ? 'نامشخص' : users.isActive ? 'فعال' : 'غیرفعال')} icon="◉" tone={users?.isActive ? 'success' : 'warning'} />
                <InfoCard data-profile-card title={i18n.t("تاریخ عضویت")} value={formatDate(users?.signUp_At, i18n.language)} icon="◷" />
                <InfoCard data-profile-card title={i18n.t("نشانی")} value={users?.address} icon="⌖" />
            </div>
        </section>
    )
}
export default ProfileInfoCards