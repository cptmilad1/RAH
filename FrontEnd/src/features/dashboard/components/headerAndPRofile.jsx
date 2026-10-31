import { useEffect, useRef } from "react"
import gsap from "gsap"

function HeaderAndProfile({navigate, user, isOnline, roleLabel}) {
    const headerRef = useRef(null)
    const dashboardRef = useRef(null)
    useEffect(() => {
        const dashboard = gsap.utils.toArray(dashboardRef.current.children)
        const context = gsap.context(() => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
            const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } })
            entrance
                .fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.5 })
            dashboard.forEach((card) => {
                gsap.fromTo(card,{yPercent : -1000},{yPercent: 0, duration: 2, stagger: 1, ease: 'elastic.inOut'})
            },[])
    })
        return () => context.revert()
    }, [])
    return (
        <header ref={headerRef} className="mb-[25px] flex items-start justify-between gap-[10px] sm:mb-[38px] sm:items-center sm:gap-6">
          <div ref={dashboardRef} className="overflow-hidden">
            <p className="overflow-hidden mb-[11px] flex items-center gap-2 text-[11px] font-bold text-[#71867c] before:h-0.5 before:w-[18px] before:rounded before:bg-[#9eb65e] before:content-['']">داشبورد شما</p>
            <h1 className="overflow-hidden m-0 text-[22px] font-extrabold tracking-tight text-[#163a30] sm:text-[clamp(26px,3vw,37px)]">سلام، {user?.name || 'دوست عزیز'} <span className="text-[.72em]">👋</span></h1>
            <p className="overflow-hidden mt-2 max-w-[270px] text-[11px] leading-[1.9] text-[#839088] sm:max-w-none sm:text-[13px]">خوشحالیم که دوباره همراه مایی. امروز کجا می‌رویم؟</p>
          </div>
          <button onClick={()=>navigate(`/profile/${user.id}`)} className="flex hover:-translate-y-1 duration-300 min-w-0 items-center gap-2 rounded-2xl border border-[#e6ebe4] bg-white/[0.78] p-[7px] shadow-[0_8px_24px_rgba(26,63,49,0.04)] sm:min-w-[190px] sm:gap-[11px] sm:px-[13px] sm:py-[10px]">
            <img src={user?.image || '/imgs/default-avatar.svg'} alt="" className="size-[34px] shrink-0 rounded-[13px] bg-[#e6edda] object-cover sm:size-10" />
            <div className="hidden min-w-0 flex-1 gap-1 sm:grid"><strong className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#264538]">{user?.name || 'کاربر راه'}</strong><span className="text-[10px] text-[#8a9991]">{roleLabel}</span></div>
            <span className={`mr-auto size-2 rounded-full ${isOnline ? 'bg-[#7fba68] shadow-[0_0_0_4px_#edf6e9]' : 'bg-[#a9b2ac] shadow-[0_0_0_4px_#f0f2ef]'}`} aria-label={isOnline ? 'آنلاین' : 'آفلاین'} />
          </button>
        </header>
    )
}
export default HeaderAndProfile