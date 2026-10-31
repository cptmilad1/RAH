import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ShipmentConversation from '../shipments/components/ShipmentConversation'
import { getShipment } from '../shipments/shipmentsApi'

function InboxChatPage() {
  const { trackingCode } = useParams()
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    getShipment(trackingCode)
      .then((shipment) => {
        if (active) setResult({ trackingCode, shipment, error: '' })
      })
      .catch((error) => {
        if (active) setResult({
          trackingCode,
          shipment: null,
          error: error.message || 'بازکردن گفت‌وگو ناموفق بود.',
        })
      })
    return () => { active = false }
  }, [trackingCode])

  const current = result?.trackingCode === trackingCode ? result : null

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/inbox" className="text-sm font-bold text-[#547460] no-underline">← بازگشت به صندوق ورودی</Link>
        {!current ? (
          <p role="status" className="mt-10 text-sm text-[#829188]">در حال بازکردن گفت‌وگو…</p>
        ) : current.error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-[#f1d4ce] bg-white p-6 text-sm text-[#a94f3d]">{current.error}</div>
        ) : current.shipment?.canChat ? (
          <>
            <header className="mt-7 rounded-[26px] bg-[linear-gradient(135deg,#1d5742,#10382e)] p-6 text-white shadow-[0_20px_50px_rgba(23,63,50,.17)] sm:p-9">
              <p className="m-0 text-xs text-[#b9d1c2]">گفت‌وگوی مرسوله</p>
              <h1 dir="ltr" className="mb-0 mt-2 text-left font-mono text-2xl font-black tracking-wider text-[#d7f36a]">{current.shipment.trackingCode}</h1>
            </header>
            <ShipmentConversation trackingCode={trackingCode} />
          </>
        ) : (
          <p role="alert" className="mt-8 rounded-2xl border border-[#f1d4ce] bg-white p-6 text-sm text-[#a94f3d]">دسترسی به این گفت‌وگو امکان‌پذیر نیست.</p>
        )}
      </div>
    </main>
  )
}

export default InboxChatPage