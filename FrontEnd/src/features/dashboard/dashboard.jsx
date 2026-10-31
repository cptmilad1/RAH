import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAuth } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../global/Card'
import MetricCard from '../../global/MetricCard'
import { getUnreadDirectMessageCount } from '../messages/messagesApi'

const roleLabels = { user: 'کاربر', admin: 'مدیر', driver: 'راننده' }
const navBaseClass = 'flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]'
const navIconClass = 'grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]'
const actionBaseClass = 'flex min-h-[72px] items-center justify-between rounded-[17px] px-5 text-right text-sm font-extrabold shadow-[0_8px_24px_rgba(22,57,43,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,57,43,0.12)]'
const accountDetailItems = [
  { label: 'نام کاربری', key: 'username', dir: 'ltr' },
  { label: 'شمارهٔ تماس', key: 'phone', dir: 'ltr' },
  { label: 'نشانی', key: 'address' },
]

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

function DashboardActionCard({ to, onClick, icon, label, variant = 'default' }) {
  const Element = to ? Link : 'button'
  const variants = {
    default: 'border border-[#d6e5dc] bg-white text-[#193e31]',
    highlight: 'border border-[#d9eaa3] bg-gradient-to-l from-[#e5f5b3] to-[#d8ef83] text-[#193e31]',
    dark: 'bg-gradient-to-l from-[#1c5942] to-[#174735] text-white shadow-[0_8px_24px_rgba(22,57,43,0.1)] hover:shadow-[0_14px_30px_rgba(22,57,43,0.18)]',
  }
  return (
    <Element
      {...(to ? { to } : { type: 'button', onClick })}
      className={`${actionBaseClass} ${to ? 'no-underline' : ''} ${variants[variant]}`}
    >
      <span className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl text-lg ${variant === 'dark' ? 'bg-white/10 text-[#d7f36a]' : 'bg-white/60'}`} aria-hidden="true">{icon}</span>
        {label}
      </span>
      <span className={`text-xl ${variant === 'dark' ? 'text-[#d7f36a]' : ''}`} aria-hidden="true">←</span>
    </Element>
  )
}

function Dashboard() {
  const { user, logout } = useAuth()
  const isOnline = usePresenceStore((state) => Boolean(user?.id && state.onlineUsers[String(user.id)]))
  const unreadDirectMessages = usePresenceStore((state) => state.unreadDirectMessages)
  const setUnreadDirectMessages = usePresenceStore((state) => state.setUnreadDirectMessages)
  const dashboardRef = useRef(null)
  const navigate = useNavigate()
  const roleLabel = roleLabels[user?.role] || 'کاربر'
  const navItems = [
    { label: 'نمای کلی', icon: '⌂', active: true },
    { label: 'صندوق ورودی', icon: '✉', to: '/inbox', unread: unreadDirectMessages > 0 },
    { label: 'پیام‌های خصوصی', icon: '●', to: '/messages', unread: unreadDirectMessages > 0 },
    { label: 'سفرهای من', icon: '↗' },
    { label: 'مرسوله‌ها', icon: '▣', onClick: () => navigate('/shipments') },
    ...(user?.role === 'driver' ? [{ label: 'پنل راننده', icon: '⇢', to: '/driver' }] : []),
    ...(user?.role === 'user' ? [{ label: 'درخواست رانندگی', icon: '＋', to: '/driver-application' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'پنل ادمین', icon: '⚙', to: '/admin' }] : []),
    { label: 'حساب کاربری', icon: '◉', to: `/profile/${user?.id}` },
  ]
  const actions = [
    { label: 'مرسوله‌ها', icon: '▣', variant: 'highlight', onClick: () => navigate('/shipments') },
    { label: 'تاکسی آنلاین', icon: '⌖', variant: 'dark' },
    ...(user?.role === 'driver' ? [{ label: 'پنل راننده', icon: '⇢', to: '/driver' }] : []),
    ...(user?.role === 'user' ? [{ label: 'ثبت‌نام به‌عنوان راننده', icon: '＋', to: '/driver-application' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'پنل ادمین', icon: '⚙', to: '/admin' }] : []),
  ]
  const stats = [
    {
      label: 'وضعیت حساب',
      icon: '✓',
      variant: 'account',
      value: user?.verify ? 'تأییدشده' : 'در انتظار تأیید',
      caption: user?.verify ? 'حساب شما آمادهٔ استفاده است' : 'برای فعال‌سازی، ایمیل خود را بررسی کنید',
    },
    { label: 'نوع حساب', icon: '✦', variant: 'white', value: roleLabel, caption: 'عضو خانوادهٔ راه' },
    { label: 'ایمیل شما', icon: '✉', variant: 'white', value: user?.email || '—', valueClassName: 'font-[Arial,sans-serif] text-[14px]', caption: 'راه ارتباطی حساب کاربری' },
  ]
  const accountDetails = accountDetailItems.map(({ label, key, dir }) => ({ label, value: user?.[key] || '—', dir }))

  useEffect(() => {
    let handlers = []
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
      entrance
        .fromTo('[data-dashboard-brand]', { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.55 })
        .fromTo('[data-dashboard-nav] > *', { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: 0.42, stagger: 0.08 }, '-=0.3')
        .fromTo('[data-dashboard-header]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.12')
        .fromTo('[data-dashboard-stat]', { opacity: 0, y: 26, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12 }, '-=0.28')
        .fromTo('[data-dashboard-lower]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.12 }, '-=0.3')

      const cards = gsap.utils.toArray('[data-dashboard-stat]')
      handlers = cards.map((card) => {
        const onMove = (event) => {
          const bounds = card.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width - 0.5
          const y = (event.clientY - bounds.top) / bounds.height - 0.5
          gsap.to(card, { rotateY: x * 3, rotateX: y * -3, y: -4, duration: 0.35, ease: 'power2.out', transformPerspective: 700 })
        }
        const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.55)' })
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerleave', onLeave)
        return () => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerleave', onLeave)
        }
      })

      gsap.to('[data-journey-glow]', { scale: 1.15, opacity: 0.8, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true })
    }, dashboardRef)

    return () => {
      context.revert()
      handlers.forEach((cleanup) => cleanup())
    }
  }, [])

  useEffect(() => {
    let active = true
    getUnreadDirectMessageCount()
      .then((count) => {
        if (active) setUnreadDirectMessages(count)
      })
      .catch((error) => {
        console.error('Unread direct message count could not be loaded:', error.message)
      })
    return () => { active = false }
  }, [setUnreadDirectMessages, user?.id])
  return (
    <main ref={dashboardRef} className="grid min-h-screen grid-cols-1 bg-[radial-gradient(ellipse_at_72%_-10%,rgba(215,243,106,0.16),transparent_38%),#f6f7f2] text-[#17352e] lg:grid-cols-[286px_minmax(0,1fr)]">
      <aside className="relative flex min-w-0 flex-col bg-[radial-gradient(circle_at_10%_82%,rgba(215,243,106,0.1),transparent_30%),linear-gradient(165deg,#123e32_0%,#0c3028_100%)] px-[18px] pt-[18px] pb-[13px] text-[#f3f7ef] sm:px-[22px] sm:pt-[25px] lg:sticky lg:top-0 lg:h-screen lg:px-[22px] lg:pt-[34px] lg:pb-[26px]">
        <div data-dashboard-brand className="flex items-center gap-[13px] px-0 lg:px-[9px]">
          <span className="grid size-[39px] shrink-0 place-items-center rounded-[13px] bg-[#d7f36a] text-[23px] font-black text-[#17352e] shadow-[0_8px_24px_rgba(215,243,106,0.16)] lg:size-[46px] lg:rounded-2xl lg:text-[25px]">ر</span>
          <span className="grid gap-0.5 text-lg font-black lg:text-[21px]">راه<small className="text-[9px] font-medium text-[#a8c0b2] lg:text-[10px]">همراه شما در شهر</small></span>
        </div>

        <nav data-dashboard-nav className="mt-[19px] flex gap-[7px] overflow-x-auto pb-[3px] lg:mt-[58px] lg:grid lg:gap-[9px] lg:overflow-visible">
          {navItems.map((item) => <DashboardNavItem key={item.label} {...item} />)}
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="mb-[17px] flex items-center gap-[11px] rounded-[15px] border border-white/[0.09] bg-white/[0.045] px-3 py-[15px]">
            <span className="grid size-8 place-items-center rounded-[11px] bg-[#d7f36a]/[0.14] font-extrabold text-[#d7f36a]">؟</span>
            <span className="grid gap-1"><strong className="text-[10px]">نیاز به راهنمایی دارید؟</strong><small className="text-[9px] text-[#a7bcb0]">ما کنار شما هستیم.</small></span>
          </div>
          <button className="flex w-full items-center justify-center gap-[13px] rounded-[14px] border border-white/[0.12] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#d2ded6] transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white" type="button" onClick={logout}>
            <span aria-hidden="true" className="text-lg">↪</span> خروج از حساب
          </button>
        </div>
      </aside>

      <section className="mx-auto w-full min-w-0 max-w-[1320px] px-[18px] pt-[29px] pb-[38px] sm:px-[30px] sm:py-10 lg:px-[clamp(28px,5vw,76px)] lg:pt-[54px] lg:pb-[60px]">
        <header data-dashboard-header className="mb-[25px] flex items-start justify-between gap-[10px] sm:mb-[38px] sm:items-center sm:gap-6">
          <div>
            <p className="mb-[11px] flex items-center gap-2 text-[11px] font-bold text-[#71867c] before:h-0.5 before:w-[18px] before:rounded before:bg-[#9eb65e] before:content-['']">داشبورد شما</p>
            <h1 className="m-0 text-[22px] font-extrabold tracking-tight text-[#163a30] sm:text-[clamp(26px,3vw,37px)]">سلام، {user?.name || 'دوست عزیز'} <span className="text-[.72em]">👋</span></h1>
            <p className="mt-2 max-w-[270px] text-[11px] leading-[1.9] text-[#839088] sm:max-w-none sm:text-[13px]">خوشحالیم که دوباره همراه مایی. امروز کجا می‌رویم؟</p>
          </div>
          <button onClick={()=>navigate(`/profile/${user.id}`)} className="flex hover:-translate-y-1 duration-300 min-w-0 items-center gap-2 rounded-2xl border border-[#e6ebe4] bg-white/[0.78] p-[7px] shadow-[0_8px_24px_rgba(26,63,49,0.04)] sm:min-w-[190px] sm:gap-[11px] sm:px-[13px] sm:py-[10px]">
            <img src={user?.image || '/imgs/default-avatar.svg'} alt="" className="size-[34px] shrink-0 rounded-[13px] bg-[#e6edda] object-cover sm:size-10" />
            <div className="hidden min-w-0 flex-1 gap-1 sm:grid"><strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#264538]">{user?.name || 'کاربر راه'}</strong><span className="text-[10px] text-[#8a9991]">{roleLabel}</span></div>
            <span className={`mr-auto size-2 rounded-full ${isOnline ? 'bg-[#7fba68] shadow-[0_0_0_4px_#edf6e9]' : 'bg-[#a9b2ac] shadow-[0_0_0_4px_#f0f2ef]'}`} aria-label={isOnline ? 'آنلاین' : 'آفلاین'} />
          </button>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => <DashboardActionCard key={action.label} {...action} />)}
        </div>
        

        <div className="mb-5 grid grid-cols-1 gap-[11px] sm:grid-cols-3 sm:gap-3 lg:gap-[17px]">
          {stats.map((stat) => <MetricCard data-dashboard-stat key={stat.label} layout="dashboard" {...stat} />)}
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.85fr)]">
          <Card data-dashboard-lower variant="unstyled" className="rounded-[19px] border border-[#e6ebe4] bg-white/[0.86] p-5 shadow-[0_10px_32px_rgba(22,57,43,0.035)] sm:p-[27px_28px]">
            <div className="mb-[21px] flex items-center justify-between">
              <div><span className="text-[10px] text-[#8a9a91]">اطلاعات شما</span><h2 className="mt-[5px] mb-0 text-[19px] font-extrabold text-[#1a3d32]">نمای کلی حساب</h2></div>
              <span className="grid size-[38px] place-items-center rounded-[13px] bg-[#f0f4eb] text-xl text-[#74936e]">◈</span>
            </div>
            <ul className="m-0 grid list-none p-0">
              {accountDetails.map(({ label, value, dir }) => <li key={label} className="flex items-center justify-between gap-5 border-b border-[#edf0eb] py-[15px] text-[11px] text-[#85928b] last:border-0 last:pb-[3px]"><span>{label}</span><strong dir={dir} className="max-w-[65%] wrap-anywhere text-xs font-bold text-[#365347]">{value}</strong></li>)}
            </ul>
          </Card>

          <Card as="aside" data-dashboard-lower variant="dark" className="min-h-[230px] p-[27px] lg:min-h-[260px]">
            <div data-journey-glow className="absolute -top-[92px] -left-[54px] size-[220px] rounded-full bg-[#d7f36a]/[0.14] blur-[2px]" />
            <span className="relative grid size-[37px] place-items-center rounded-[13px] bg-[#d7f36a]/[0.16] text-[#d7f36a]">✦</span>
            <p className="relative mt-6 mb-2 text-[10px] text-[#b9d1c2]">هر روز، یک مسیر تازه</p>
            <h2 className="relative m-0 text-[23px] leading-[1.65] font-extrabold text-[#f5f7ef]">شهر منتظر<br />قدم‌های توست.</h2>
            <span aria-hidden="true" className="absolute -bottom-[35px] left-[18px] -rotate-12 text-[115px] font-black text-[#d7f36a]/[0.09]">راه</span>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
