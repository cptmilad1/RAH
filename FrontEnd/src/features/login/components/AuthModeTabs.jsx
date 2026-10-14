import { Link } from 'react-router-dom'

function AuthModeTabs({ mode }) {
  return (
    <div
      data-form-item
      className="mb-6 grid grid-cols-2 gap-[5px] rounded-[14px] border border-[#e7ece5] bg-[#f1f4ef] p-[5px]"
      role="tablist"
      aria-label="انتخاب روش ورود"
    >
      <Link
        to="/login"
        role="tab"
        aria-selected={mode === 'login'}
        className={`grid min-h-[42px] place-items-center rounded-[10px] text-xs font-bold transition duration-200 hover:text-[#365a48] ${mode === 'login' ? 'bg-white text-[#204c39] shadow-[0_3px_10px_rgba(32,76,57,0.08)]' : 'text-[#829088]'}`}
      >
        ورود
      </Link>
      <Link
        to="/signup"
        role="tab"
        aria-selected={mode === 'signup'}
        className={`grid min-h-[42px] place-items-center rounded-[10px] text-xs font-bold transition duration-200 hover:text-[#365a48] ${mode === 'signup' ? 'bg-white text-[#204c39] shadow-[0_3px_10px_rgba(32,76,57,0.08)]' : 'text-[#829088]'}`}
      >
        ساخت حساب
      </Link>
    </div>
  )
}

export default AuthModeTabs
