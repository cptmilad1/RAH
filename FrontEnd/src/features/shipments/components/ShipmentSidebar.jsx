import { Link } from 'react-router-dom'

function ShipmentSidebar({ user, logout }) {
  return (
    <aside className="flex flex-col bg-[linear-gradient(165deg,#123e32,#0c3028)] px-5 py-5 text-white sm:px-7 lg:sticky lg:top-0 lg:h-screen lg:px-6 lg:py-8">
      <Link to="/dashboard" className="flex items-center gap-3 text-white no-underline">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#d7f36a] text-xl font-black text-[#17352e]">ر</span>
        <span className="grid text-lg font-black">راه<small className="text-[10px] font-medium text-[#a8c0b2]">همراه شما در شهر</small></span>
      </Link>
      <nav aria-label="ناوبری اصلی" className="mt-7 flex gap-2 overflow-x-auto lg:mt-14 lg:grid">
        <Link to="/dashboard" className="shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-[#b8c9c0] no-underline transition hover:bg-white/10 hover:text-white">⌂ نمای کلی</Link>
        <Link to="/shipments" aria-current="page" className="shrink-0 rounded-xl bg-[#d7f36a]/15 px-4 py-3 text-sm font-extrabold text-[#e7f5b5] no-underline">▣ مرسوله‌ها</Link>
        <Link to={`/profile/${user?.id}`} className="shrink-0 rounded-xl px-4 py-3 text-sm font-semibold text-[#b8c9c0] no-underline transition hover:bg-white/10 hover:text-white">◉ حساب کاربری</Link>
      </nav>
      <button type="button" onClick={logout} className="mt-auto hidden rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-[#d2ded6] transition hover:bg-white/10 lg:block">خروج از حساب ↪</button>
    </aside>
  )
}

export default ShipmentSidebar
