import { useState } from 'react'

function ShipmentPageHeader({ onCreate, onTrack }) {
  const [trackingCode, setTrackingCode] = useState('')

  function submitTracking(event) {
    event.preventDefault()
    const code = trackingCode.trim()
    if (code) onTrack(code)
  }

  return (
    <header data-shipment-intro className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-2 text-xs font-bold text-[#71867c]">فضای اختصاصی شما</p>
        <h1 className="m-0 text-3xl font-black tracking-tight sm:text-4xl">مرسوله‌های من</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#7b8982]">ارسال‌ها را مدیریت کن و با کد رهگیری از وضعیت و مسیر هر مرسوله باخبر شو.</p>
        <form onSubmit={submitTracking} className="mt-4 flex max-w-xl gap-2">
          <label htmlFor="shipment-tracking-code" className="sr-only">کد رهگیری مرسوله</label>
          <input
            id="shipment-tracking-code"
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            placeholder="کد رهگیری را وارد کن"
            className="min-w-0 flex-1 rounded-xl border border-[#dfe8df] bg-white px-4 py-3 text-sm outline-none focus:border-[#77955f]"
          />
          <button type="submit" className="rounded-xl border border-[#dfe8df] bg-white px-4 py-3 text-sm font-bold text-[#315d49]">رهگیری</button>
        </form>
      </div>
      <button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-2xl bg-[#173f32] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(23,63,50,.18)] transition hover:-translate-y-0.5 hover:bg-[#205742]">
        <span className="text-lg text-[#d7f36a]">＋</span> ثبت مرسولهٔ تازه
      </button>
    </header>
  )
}

export default ShipmentPageHeader
