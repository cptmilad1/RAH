function AuthSubmitButton({ busy, children }) {
  return (
    <button
      data-form-item
      type="submit"
      disabled={busy}
      className="group mt-1 flex min-h-[53px] w-full items-center justify-between rounded-[13px] bg-gradient-to-l from-[#1c5942] to-[#174735] py-2 pr-[18px] pl-[9px] text-xs font-extrabold text-white shadow-[0_9px_20px_rgba(26,78,57,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_13px_25px_rgba(26,78,57,0.2)] disabled:cursor-wait disabled:opacity-65"
    >
      <span>{busy ? 'لطفاً صبر کنید...' : children}</span>
      <span
        className="grid size-9 place-items-center rounded-[10px] bg-[#d7f36a] text-[19px] text-[#163b2e] transition-transform duration-200 group-hover:-translate-x-1"
        aria-hidden="true"
      >
        ←
      </span>
    </button>
  )
}

export default AuthSubmitButton
