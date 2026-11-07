import i18n from '../../settings/locals/i18n.js'
import gsap from "gsap";
import { useEffect, useRef } from "react";
import SplitType from "split-type";
import exportUsers from '../utils/exportUsers'

function Header({ fetchUsers, loading, filteredUsers }) {
  const panelRef = useRef(null)
  const descriptionRef = useRef(null)
  const buttonRef = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const panelSplit = new SplitType(panelRef.current, { types: 'lines, words', lineClass: 'line' })
    const descriptionSplit = new SplitType(descriptionRef.current, { types: 'words' })
    const context = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { duration: 1, ease: 'elastic.out(2, 0.5)' } })
      tl.fromTo(panelSplit.words, { yPercent: '300' }, { yPercent: 0, stagger: 0.3 }, '+=0.1')
      tl.fromTo(descriptionSplit.words, { yPercent: '100' }, { yPercent: 0, stagger: 0.02 })
        .fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.5 }, '-=0.5')
    }, panelRef.current)
    return () => {
      context.revert()
      panelSplit.revert()
      descriptionSplit.revert()
    }
  }, [])
  return (<>
    <header data-admin-header className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div data-content className="overflow-hidden mb-10 flex flex-col gap-4">
        <p className="mb-2 mt-5 text-xs font-bold text-[#789083]">{i18n.t("مدیریت سامانه")}</p>
        <h1 ref={panelRef} className="m-0 text-2xl font-black text-[#163a30] sm:text-3xl">{i18n.t("پنل ادمین")}</h1>
        <p ref={descriptionRef} className="mb-0 mt-2 text-sm text-[#7b8c82] flex">{i18n.t("مدیریت کاربران، درخواست‌های رانندگی و وضعیت حساب‌ها")}</p>
      </div>
      <div ref={buttonRef} className="flex flex-wrap gap-2">
        <button type="button" onClick={fetchUsers} disabled={loading} className="min-h-11 rounded-xl border border-[#dce6dc] bg-white px-4 text-xs font-bold text-[#315946] disabled:opacity-60">{i18n.t("↻ تازه‌سازی فهرست")}</button>
        <button type="button" onClick={() => exportUsers(filteredUsers)} disabled={!filteredUsers.length} className="min-h-11 rounded-xl bg-[#174c3c] px-4 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{i18n.t("↓ خروجی CSV")}</button>
      </div>
    </header>
  </>
  )
}
export default Header