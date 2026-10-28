import { statusLabels } from '../shipmentConstants'

function ShipmentDetailsHeader({ trackingCode, status }) {
  return (
    <header className="mt-7 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-6 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-9">
      <p className="m-0 text-xs text-[#b9d1c2]">کد رهگیری مرسوله</p>
      <h1 dir="ltr" className="mb-4 mt-2 text-left font-mono text-2xl font-black tracking-wider text-[#d7f36a] sm:text-3xl">{trackingCode}</h1>
      <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{statusLabels[status] || status}</span>
    </header>
  )
}

export default ShipmentDetailsHeader
