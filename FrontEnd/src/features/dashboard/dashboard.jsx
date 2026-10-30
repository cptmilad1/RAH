import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useAuth } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import { Link, useNavigate } from 'react-router-dom'

function Dashboard() {
  const { user, logout } = useAuth()
  const isOnline = usePresenceStore((state) => Boolean(user?.id && state.onlineUsers[String(user.id)]))
  const dashboardRef = useRef(null)
  const roleLabels = { user: 'کاربر', admin: 'مدیر', driver: 'راننده' }
  const roleLabel = roleLabels[user?.role] || 'کاربر'

  useEffect(() => {
    let handlers = []
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
      entrance
        .from('[data-dashboard-brand]', { autoAlpha: 0, x: 18, duration: 0.55 })
        .from('[data-dashboard-nav] > *', { autoAlpha: 0, x: 16, duration: 0.42, stagger: 0.08 }, '-=0.3')
        .from('[data-dashboard-header]', { autoAlpha: 0, y: 20, duration: 0.65 }, '-=0.12')
        .from('[data-dashboard-stat]', { autoAlpha: 0, y: 26, scale: 0.97, duration: 0.6, stagger: 0.12 }, '-=0.28')
        .from('[data-dashboard-lower]', { autoAlpha: 0, y: 22, duration: 0.65, stagger: 0.12 }, '-=0.3')

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
  const navigate = useNavigate()
  return (
    <main ref={dashboardRef} className="grid min-h-screen grid-cols-1 bg-[radial-gradient(ellipse_at_72%_-10%,rgba(215,243,106,0.16),transparent_38%),#f6f7f2] text-[#17352e] lg:grid-cols-[286px_minmax(0,1fr)]">
      <aside className="relative flex min-w-0 flex-col bg-[radial-gradient(circle_at_10%_82%,rgba(215,243,106,0.1),transparent_30%),linear-gradient(165deg,#123e32_0%,#0c3028_100%)] px-[18px] pt-[18px] pb-[13px] text-[#f3f7ef] sm:px-[22px] sm:pt-[25px] lg:sticky lg:top-0 lg:h-screen lg:px-[22px] lg:pt-[34px] lg:pb-[26px]">
        <div data-dashboard-brand className="flex items-center gap-[13px] px-0 lg:px-[9px]">
          <span className="grid size-[39px] shrink-0 place-items-center rounded-[13px] bg-[#d7f36a] text-[23px] font-black text-[#17352e] shadow-[0_8px_24px_rgba(215,243,106,0.16)] lg:size-[46px] lg:rounded-2xl lg:text-[25px]">ر</span>
          <span className="grid gap-0.5 text-lg font-black lg:text-[21px]">راه<small className="text-[9px] font-medium text-[#a8c0b2] lg:text-[10px]">همراه شما در شهر</small></span>
        </div>

        <nav data-dashboard-nav className="mt-[19px] flex gap-[7px] overflow-x-auto pb-[3px] lg:mt-[58px] lg:grid lg:gap-[9px] lg:overflow-visible">
          <button type="button" className="flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] bg-[#d7f36a]/[0.13] px-3 py-2.5 text-[11px] font-extrabold text-[#e7f5b5] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]">
            <span className="grid size-[19px] place-items-center rounded-lg text-[14px] text-[#d7f36a] lg:size-[23px] lg:text-[17px]">⌂</span> نمای کلی
          </button>
          <button type="button" className="flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] font-semibold text-[#b8c9c0] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]">
            <span className="grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]">↗</span> سفرهای من
          </button>
          <button type="button" onClick={() => navigate('/shipments')} className="flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] font-semibold text-[#b8c9c0] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]">
            <span className="grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]">▣</span> مرسوله‌ها
          </button>
          {user?.role === 'driver' && <Link to="/driver" className="flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] font-semibold text-[#b8c9c0] no-underline transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]">
            <span className="grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]" aria-hidden="true">⇢</span> پنل راننده
          </Link>}
          <button type="button" className="flex w-auto shrink-0 items-center gap-[7px] rounded-[14px] px-3 py-2.5 text-[11px] font-semibold text-[#b8c9c0] transition duration-200 hover:bg-white/[0.07] hover:text-white lg:w-full lg:gap-[13px] lg:px-4 lg:py-3.5 lg:text-[13px]">
            <span className="grid size-[19px] place-items-center rounded-lg text-[14px] text-[#8eaa9b] lg:size-[23px] lg:text-[17px]">◉</span> حساب کاربری
          </button>
          {user?.role === 'driver' && <button onClick={() => navigate('/driver')} type="button" className="flex min-h-[72px] items-center justify-between rounded-[17px] border border-[#d6e5dc] bg-white px-5 text-right text-sm font-extrabold text-[#193e31] shadow-[0_8px_24px_rgba(22,57,43,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,57,43,0.12)]">
            <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#edf4eb] text-lg text-[#315946]" aria-hidden="true">⇢</span>پنل راننده</span>
            <span className="text-xl" aria-hidden="true">←</span>
          </button>}
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
            <div className="grid size-[34px] shrink-0 place-items-center rounded-[13px] bg-[#e6edda] text-[17px] font-extrabold text-[#315946] sm:size-10">{(user?.name || 'ر').slice(0, 1)}</div>
            <div className="hidden min-w-0 flex-1 gap-1 sm:grid"><strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#264538]">{user?.name || 'کاربر راه'}</strong><span className="text-[10px] text-[#8a9991]">{roleLabel}</span></div>
            <span className={`mr-auto size-2 rounded-full ${isOnline ? 'bg-[#7fba68] shadow-[0_0_0_4px_#edf6e9]' : 'bg-[#a9b2ac] shadow-[0_0_0_4px_#f0f2ef]'}`} aria-label={isOnline ? 'آنلاین' : 'آفلاین'} />
          </button>
        </header>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
          onClick={()=>{navigate('/shipments')}}
            type="button"
            className="flex min-h-[72px] items-center justify-between rounded-[17px] border border-[#d9eaa3] bg-gradient-to-l from-[#e5f5b3] to-[#d8ef83] px-5 text-right text-sm font-extrabold text-[#193e31] shadow-[0_8px_24px_rgba(22,57,43,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,57,43,0.12)]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/60 text-lg" aria-hidden="true">▣</span>
              مرسوله‌ها
            </span>
            <span className="text-xl" aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="flex min-h-[72px] items-center justify-between rounded-[17px] bg-gradient-to-l from-[#1c5942] to-[#174735] px-5 text-right text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(22,57,43,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(22,57,43,0.18)]"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-lg text-[#d7f36a]" aria-hidden="true">⌖</span>
              تاکسی آنلاین
            </span>
            <span className="text-xl text-[#d7f36a]" aria-hidden="true">←</span>
          </button>
        </div>
        

        <div className="mb-5 grid grid-cols-1 gap-[11px] sm:grid-cols-3 sm:gap-3 lg:gap-[17px]">
          <article data-dashboard-stat className="group relative grid min-h-[150px] justify-items-start gap-[11px] overflow-hidden rounded-[19px] border border-[#d9eaa3] bg-gradient-to-br from-[#e5f5b3] to-[#d8ef83] p-[19px_17px] shadow-[0_10px_32px_rgba(22,57,43,0.035)] transition-shadow duration-300 hover:shadow-[0_18px_38px_rgba(22,57,43,0.12)] before:absolute before:-bottom-[45px] before:-left-[27px] before:size-28 before:rounded-full before:border before:border-[#1a4c3b]/[0.055] before:shadow-[0_0_0_16px_rgba(26,76,59,0.025),0_0_0_32px_rgba(26,76,59,0.018)] before:content-[''] lg:min-h-[178px] lg:p-[22px_23px]">
            <span className="grid size-[34px] place-items-center rounded-[11px] bg-white/55 text-[15px] font-black text-[#477244]">✓</span>
            <span className="text-[11px] font-semibold text-[#597347]">وضعیت حساب</span>
            <strong className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[17px] font-extrabold text-[#193e31]">{user?.verify ? 'تأییدشده' : 'در انتظار تأیید'}</strong>
            <small className="text-[10px] text-[#617a4b]">{user?.verify ? 'حساب شما آمادهٔ استفاده است' : 'برای فعال‌سازی، ایمیل خود را بررسی کنید'}</small>
          </article>
          <article data-dashboard-stat className="group relative grid min-h-[150px] justify-items-start gap-[11px] overflow-hidden rounded-[19px] border border-[#e6ebe4] bg-white/[0.86] p-[19px_17px] shadow-[0_10px_32px_rgba(22,57,43,0.035)] transition-shadow duration-300 hover:shadow-[0_18px_38px_rgba(22,57,43,0.12)] before:absolute before:-bottom-[45px] before:-left-[27px] before:size-28 before:rounded-full before:border before:border-[#1a4c3b]/[0.055] before:shadow-[0_0_0_16px_rgba(26,76,59,0.025),0_0_0_32px_rgba(26,76,59,0.018)] before:content-[''] lg:min-h-[178px] lg:p-[22px_23px]">
            <span className="grid size-[34px] place-items-center rounded-[11px] bg-[#eff3ea] text-[15px] font-black text-[#547460]">✦</span>
            <span className="text-[11px] font-semibold text-[#718078]">نوع حساب</span>
            <strong className="text-[17px] font-extrabold text-[#193e31]">{roleLabel}</strong>
            <small className="text-[10px] text-[#84918a]">عضو خانوادهٔ راه</small>
          </article>
          <article data-dashboard-stat className="group relative grid min-h-[150px] justify-items-start gap-[11px] overflow-hidden rounded-[19px] border border-[#e6ebe4] bg-white/[0.86] p-[19px_17px] shadow-[0_10px_32px_rgba(22,57,43,0.035)] transition-shadow duration-300 hover:shadow-[0_18px_38px_rgba(22,57,43,0.12)] before:absolute before:-bottom-[45px] before:-left-[27px] before:size-28 before:rounded-full before:border before:border-[#1a4c3b]/[0.055] before:shadow-[0_0_0_16px_rgba(26,76,59,0.025),0_0_0_32px_rgba(26,76,59,0.018)] before:content-[''] lg:min-h-[178px] lg:p-[22px_23px]">
            <span className="grid size-[34px] place-items-center rounded-[11px] bg-[#eff3ea] text-[15px] font-black text-[#547460]">✉</span>
            <span className="text-[11px] font-semibold text-[#718078]">ایمیل شما</span>
            <strong dir="ltr" className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-[Arial,sans-serif] text-[14px] font-extrabold text-[#193e31]">{user?.email || '—'}</strong>
            <small className="text-[10px] text-[#84918a]">راه ارتباطی حساب کاربری</small>
          </article>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.85fr)]">
          <div data-dashboard-lower className="rounded-[19px] border border-[#e6ebe4] bg-white/[0.86] p-5 shadow-[0_10px_32px_rgba(22,57,43,0.035)] sm:p-[27px_28px]">
            <div className="mb-[21px] flex items-center justify-between">
              <div><span className="text-[10px] text-[#8a9a91]">اطلاعات شما</span><h2 className="mt-[5px] mb-0 text-[19px] font-extrabold text-[#1a3d32]">نمای کلی حساب</h2></div>
              <span className="grid size-[38px] place-items-center rounded-[13px] bg-[#f0f4eb] text-xl text-[#74936e]">◈</span>
            </div>
            <ul className="m-0 grid list-none p-0">
              <li className="flex items-center justify-between gap-5 border-b border-[#edf0eb] py-[15px] text-[11px] text-[#85928b] last:border-0 last:pb-[3px]"><span>نام کاربری</span><strong dir="ltr" className="max-w-[65%] wrap-anywhere text-xs font-bold text-[#365347]">{user?.username || '—'}</strong></li>
              <li className="flex items-center justify-between gap-5 border-b border-[#edf0eb] py-[15px] text-[11px] text-[#85928b] last:border-0 last:pb-[3px]"><span>شمارهٔ تماس</span><strong dir="ltr" className="max-w-[65%] wrap-anywhere text-xs font-bold text-[#365347]">{user?.phone || '—'}</strong></li>
              <li className="flex items-center justify-between gap-5 border-b border-[#edf0eb] py-[15px] text-[11px] text-[#85928b] last:border-0 last:pb-[3px]"><span>نشانی</span><strong className="max-w-[65%] wrap-anywhere text-xs font-bold text-[#365347]">{user?.address || '—'}</strong></li>
            </ul>
          </div>

          <aside data-dashboard-lower className="relative min-h-[230px] overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#1d5742,#10382e)] p-[27px] text-white lg:min-h-[260px]">
            <div data-journey-glow className="absolute -top-[92px] -left-[54px] size-[220px] rounded-full bg-[#d7f36a]/[0.14] blur-[2px]" />
            <span className="relative grid size-[37px] place-items-center rounded-[13px] bg-[#d7f36a]/[0.16] text-[#d7f36a]">✦</span>
            <p className="relative mt-6 mb-2 text-[10px] text-[#b9d1c2]">هر روز، یک مسیر تازه</p>
            <h2 className="relative m-0 text-[23px] leading-[1.65] font-extrabold text-[#f5f7ef]">شهر منتظر<br />قدم‌های توست.</h2>
            <span aria-hidden="true" className="absolute -bottom-[35px] left-[18px] -rotate-12 text-[115px] font-black text-[#d7f36a]/[0.09]">راه</span>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default Dashboard
