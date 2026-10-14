const inputClassName = 'min-h-12 w-full rounded-xl border border-[#e1e8e0] bg-white/90 px-3.5 text-xs text-[#244738] transition duration-200 placeholder:text-[#a8b2ac] focus:border-[#8eae91] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#82aa85]/[0.12]'

function AuthField({ label, registration, error, className = '', ...inputProps }) {
  return (
    <label data-form-item className={`grid gap-2 text-[11px] font-bold text-[#385247] ${className}`}>
      <span>{label}</span>
      <input {...registration} {...inputProps} className={inputClassName} />
      {error && <small className="text-[10px] font-medium text-[#9d4b40]">{error}</small>}
    </label>
  )
}

export default AuthField
