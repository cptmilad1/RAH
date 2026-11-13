import i18n from '../../settings/locals/i18n.js'
import { useEffect } from "react"
import DashboardNavItem from "./utils/dashboearNavItems"
import gsap from 'gsap'
import { IoHelpCircleOutline, IoSettingsSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next'

function NavbarSide({navItems}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  useEffect(() => {
      const context = gsap.context(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  
        const entrance = gsap.timeline({ defaults: { ease: 'elastic.inOut' , duration : 0.5} })
        entrance
          .fromTo('[data-dashboard-brand]', { opacity: 0, xPercent: 100 }, { opacity: 1, xPercent: 0, duration: 1})
          .fromTo('[data-dashboard-nav] > *', { opacity: 0, yPercent: 1000 }, { opacity: 1, yPercent: 0, stagger: 0.2 })
          return () => context.revert()
        })
  }, [])
    return (
    <aside style={{ background: 'radial-gradient(circle at 10% 82%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 30%), linear-gradient(165deg, var(--green) 0%, var(--deep-green) 100%)' }} className="relative flex w-full min-w-0 shrink-0 flex-col px-[18px] pt-[18px] pb-[13px] text-[#f3f7ef] sm:px-[22px] sm:pt-[25px] lg:sticky lg:top-0 lg:h-screen lg:w-[286px] lg:px-[22px] lg:pt-[34px] lg:pb-[26px]">
        <div data-dashboard-brand className="flex justify-between items-center gap-[13px] px-0 lg:px-[9px]">
          <div className="flex w-full h-full gap-3">
            <span style={{ backgroundColor: 'var(--accent)', color: 'var(--deep-green)' }} className="grid size-[39px] shrink-0 place-items-center rounded-[13px] text-[23px] font-black shadow-[0_8px_24px_rgba(215,243,106,0.16)] lg:size-[46px] lg:rounded-2xl lg:text-[25px]">{i18n.t("ر")}</span>
            <span className="grid gap-0.5 text-lg font-black lg:text-[21px]">{i18n.t("راه")}<small className="text-[9px] font-medium text-[#a8c0b2] lg:text-[10px]">{i18n.t("همراه شما در شهر")}</small></span>
          </div>
          <button type="button" aria-label={t('settings.title')} title={t('settings.title')} onClick={() => navigate('/settings')} style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }} className="grid size-[39px] shrink-0 place-items-center rounded-[13px] border-0 shadow-[0_8px_24px_rgba(215,243,106,0.16)] transition hover:bg-[#d7f36a]/[0.2] lg:size-[46px] lg:rounded-2xl">
            <IoSettingsSharp className="text-xl text-black/50" />
          </button>
        </div>

        <nav data-dashboard-nav aria-label={t('ناوبری اصلی')} className="mt-[19px] flex gap-[7px] overflow-x-auto overflow-y-hidden pb-2 scroll-smooth [scrollbar-color:var(--app-accent)_rgb(255_255_255_/_12%)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[rgb(255_255_255_/_10%)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[rgb(255_255_255_/_30%)] [&::-webkit-scrollbar-thumb]:bg-[linear-gradient(90deg,var(--app-accent),#9ec64f)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-accent)] lg:mt-[58px] lg:grid lg:gap-[9px] lg:overflow-visible lg:pb-0">
          {navItems.map((item) => <DashboardNavItem key={item.label} {...item} />)}
        </nav>

        <div className="mt-auto hidden lg:block">
          <Link to="/help" className="mb-[17px] flex items-center gap-[11px] rounded-[15px] border border-white/[0.09] bg-white/[0.045] px-3 py-[15px] text-white no-underline transition hover:bg-white/[0.09]">
            <span className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-white/10 text-xl text-white"><IoHelpCircleOutline aria-hidden="true" /></span>
            <span className="grid gap-1"><strong className="text-[10px]">{i18n.t("نیاز به راهنمایی دارید؟")}</strong><small className="text-[9px] text-[#a7bcb0]">{i18n.t("ما کنار شما هستیم.")}</small></span>
          </Link>
        </div>
      </aside>
    )
}
export default NavbarSide