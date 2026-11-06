import { localizeText } from '../../settings/locals/localizedText.js'
import { useEffect } from "react"
import DashboardNavItem from "./utils/dashboearNavItems"
import gsap from 'gsap'
import { IoSettingsSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next'

function NavbarSide({navItems, logout}) {
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
    <aside style={{ background: 'radial-gradient(circle at 10% 82%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 30%), linear-gradient(165deg, var(--green) 0%, var(--deep-green) 100%)' }} className="relative flex min-w-0 flex-col px-[18px] pt-[18px] pb-[13px] text-[#f3f7ef] sm:px-[22px] sm:pt-[25px] lg:sticky lg:top-0 lg:h-screen lg:px-[22px] lg:pt-[34px] lg:pb-[26px]">
        <div data-dashboard-brand className="flex justify-between items-center gap-[13px] px-0 lg:px-[9px]">
          <div className="flex w-full h-full gap-3">
            <span style={{ backgroundColor: 'var(--accent)', color: 'var(--deep-green)' }} className="grid size-[39px] shrink-0 place-items-center rounded-[13px] text-[23px] font-black shadow-[0_8px_24px_rgba(215,243,106,0.16)] lg:size-[46px] lg:rounded-2xl lg:text-[25px]">{localizeText("ر")}</span>
            <span className="grid gap-0.5 text-lg font-black lg:text-[21px]">{localizeText("راه")}<small className="text-[9px] font-medium text-[#a8c0b2] lg:text-[10px]">{localizeText("همراه شما در شهر")}</small></span>
          </div>
          <button type="button" aria-label={localizeText(t('settings.title'))} title={localizeText(t('settings.title'))} onClick={() => navigate('/settings')} style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }} className="grid size-[39px] shrink-0 place-items-center rounded-[13px] border-0 shadow-[0_8px_24px_rgba(215,243,106,0.16)] transition hover:bg-[#d7f36a]/[0.2] lg:size-[46px] lg:rounded-2xl">
            <IoSettingsSharp className="text-xl text-black/50" />
          </button>
        </div>

        <nav data-dashboard-nav className="overflow-hidden mt-[19px] flex gap-[7px] overflow-x-auto pb-[3px] lg:mt-[58px] lg:grid lg:gap-[9px] lg:overflow-visible">
          {navItems.map((item) => <DashboardNavItem key={item.label} {...item} />)}
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="mb-[17px] flex items-center gap-[11px] rounded-[15px] border border-white/[0.09] bg-white/[0.045] px-3 py-[15px]">
            <span className="grid size-8 place-items-center rounded-[11px] bg-[#d7f36a]/[0.14] font-extrabold text-[#d7f36a]">{localizeText("؟")}</span>
            <span className="grid gap-1"><strong className="text-[10px]">{localizeText("نیاز به راهنمایی دارید؟")}</strong><small className="text-[9px] text-[#a7bcb0]">{localizeText("ما کنار شما هستیم.")}</small></span>
          </div>
          <button className="flex w-full items-center justify-center gap-[13px] rounded-[14px] border border-white/[0.12] bg-transparent px-4 py-3.5 text-[13px] font-semibold text-[#d2ded6] transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white" type="button" onClick={logout}>
            <span aria-hidden="true" className="text-lg">↪</span>{' '}{localizeText("خروج از حساب")}</button>
        </div>
      </aside>
    )
}
export default NavbarSide