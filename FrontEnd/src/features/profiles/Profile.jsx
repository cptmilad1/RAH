import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Link, useParams } from 'react-router-dom'
import milad from '/imgs/milad.png'
import useProfile from './hooks/UseProfile'
import roleChecker from './utils/roleChecker'
import InfoCard from '../../global/InfoCard'
import { useAuthStore } from '../auth/authStore'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function Profile() {
  const { id } = useParams()
  const users = useProfile((state) => state.users)
  const setUsers = useProfile((state) => state.setUsers)
  const currentUser = useAuthStore((state) => state.user)
  const profileRef = useRef(null)
  const canEdit = currentUser?.role === 'admin' || String(currentUser?.id) === String(id)

  useEffect(() => {
    setUsers(id).catch(() => undefined)
  }, [id, setUsers])

  useEffect(() => {
    const root = profileRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('[data-profile-hero]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo('[data-profile-card]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.25')
    }, root)

    return () => context.revert()
  }, [])

  const roleLabel = roleChecker(users?.role)

  return (
    <main ref={profileRef} className="min-h-screen bg-[radial-gradient(ellipse_at_76%_-12%,rgba(215,243,106,0.18),transparent_34%),#f6f7f2] px-4 py-5 text-[#17352e] sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-[1080px]">
        <header className="mb-5 flex items-center justify-between sm:mb-7">
          <Link to="/dashboard" className="group inline-flex items-center gap-2 text-xs font-bold text-[#587366] transition hover:text-[#17352e]">
            <span className="grid size-9 place-items-center rounded-xl border border-[#e0e8dc] bg-white text-base transition group-hover:-translate-x-0.5" aria-hidden="true">→</span>
            بازگشت به داشبورد
          </Link>
          <span className="flex items-center gap-2 text-sm font-black text-[#234a39]">
            <span className="grid size-8 place-items-center rounded-[11px] bg-[#d7f36a] text-base text-[#17352e]">ر</span>
            راه
          </span>
        </header>

        <section data-profile-hero className="relative isolate overflow-hidden rounded-[20px] bg-[radial-gradient(circle_at_12%_100%,rgba(215,243,106,0.13),transparent_31%),linear-gradient(125deg,#123e32,#1c5942)] px-5 py-7 text-white sm:px-9 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -left-14 -top-20 -z-10 size-64 rounded-full border border-white/[0.08] shadow-[0_0_0_26px_rgba(255,255,255,0.025),0_0_0_52px_rgba(255,255,255,0.02)]" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <img src={users?.image || milad} alt={`تصویر ${users?.name || 'کاربر'}`} className="size-[82px] shrink-0 rounded-[22px] border border-white/20 bg-white/10 object-cover p-1 shadow-[0_12px_30px_rgba(5,33,24,0.22)] sm:size-[102px] sm:rounded-[26px]" />
            <div className="min-w-0 flex-1">
              <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold text-[#d8e8bc]">
                <i className="size-1.5 rounded-full bg-[#d7f36a]" />
                نمایهٔ کاربری
              </span>
              <h1 className="m-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[25px] font-extrabold text-[#f4f7ef] sm:text-[32px]">{users?.name || 'کاربر راه'}</h1>
              <p className="mt-1.5 text-xs text-[#c0d4c7]">اطلاعات حساب و راه‌های ارتباطی</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7f36a]/20 bg-[#d7f36a]/[0.1] px-3.5 py-2 text-[11px] font-bold text-[#e5f2bd]">
              {roleLabel}
              <span className="size-1.5 rounded-full bg-[#d7f36a]" />
            </span>
            {canEdit && (
              <Link
                to={`/profile/${id}/edit`}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#d7f36a] px-4 text-xs font-extrabold text-[#17352e] transition hover:-translate-y-0.5 hover:bg-[#e2f88c]"
              >
                <span aria-hidden="true">✎</span>
                ویرایش پروفایل
              </Link>
            )}
          </div>
        </section>

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
      </div>
    </main>
  )
}

export default Profile