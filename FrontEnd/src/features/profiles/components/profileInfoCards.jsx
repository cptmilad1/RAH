import InfoCard from '../../../global/InfoCard'
import formatDate from '../utils/formatData'

function ProfileInfoCards({ users, roleLabel }) {
    return (
        <section aria-labelledby="profile-details-title" className="mt-6 sm:mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <p className="mb-1.5 text-[10px] font-bold text-[#829087]">حساب کاربری</p>
                    <h2 id="profile-details-title" className="m-0 text-lg font-extrabold text-[#1a3d32] sm:text-xl">جزئیات پروفایل</h2>
                </div>
                <span className="text-[10px] text-[#8a9991]">اطلاعات ثبت‌شده</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <InfoCard data-profile-card title="شناسه حساب" value={users?.id} icon="#" dir="ltr" />
                <InfoCard data-profile-card title="نام کاربری" value={users?.username} icon="@" dir="ltr" />
                <InfoCard data-profile-card title="نشانی ایمیل" value={users?.email} icon="✉" dir="ltr" />
                <InfoCard data-profile-card title="شماره تماس" value={users?.phone} icon="☎" dir="ltr" />
                <InfoCard data-profile-card title="نوع حساب" value={roleLabel} icon="✦" />
                <InfoCard data-profile-card title="تأیید ایمیل" value={users?.verify == null ? 'نامشخص' : users.verify ? 'تأیید شده' : 'در انتظار تأیید'} icon="✓" tone={users?.verify ? 'success' : 'warning'} />
                <InfoCard data-profile-card title="وضعیت حساب" value={users?.isActive == null ? 'نامشخص' : users.isActive ? 'فعال' : 'غیرفعال'} icon="◉" tone={users?.isActive ? 'success' : 'warning'} />
                <InfoCard data-profile-card title="تاریخ عضویت" value={formatDate(users?.signUp_At)} icon="◷" />
                <InfoCard data-profile-card title="نشانی" value={users?.address} icon="⌖" />
            </div>
        </section>
    )
}
export default ProfileInfoCards