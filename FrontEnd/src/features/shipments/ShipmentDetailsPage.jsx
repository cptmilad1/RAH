import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ShipmentDetailsHeader from './components/ShipmentDetailsHeader'
import ShipmentInformation from './components/ShipmentInformation'
import ShipmentStatusHistory from './components/ShipmentStatusHistory'
import { getShipment } from './shipmentsApi'

function ShipmentDetailsPage() {
  const { trackingCode } = useParams()
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    getShipment(trackingCode)
      .then((shipment) => { if (active) setResult({ trackingCode, shipment, error: '' }) })
      .catch((requestError) => {
        if (active) setResult({ trackingCode, shipment: null, error: requestError.message || 'دریافت جزئیات مرسوله ناموفق بود.' })
      })
    return () => { active = false }
  }, [trackingCode])

  const currentResult = result?.trackingCode === trackingCode ? result : null
  const shipment = currentResult?.shipment

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7f1] px-4 py-8 text-[#17352e] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/shipments" className="text-sm font-bold text-[#547460] no-underline">→ بازگشت به مرسوله‌ها</Link>
        {!currentResult ? (
          <p className="mt-10 text-sm text-[#829188]">در حال دریافت جزئیات…</p>
        ) : currentResult.error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-[#f1d4ce] bg-white p-6 text-sm text-[#a94f3d]">{currentResult.error}</div>
        ) : shipment && (
          <>
            <ShipmentDetailsHeader trackingCode={shipment.trackingCode} status={shipment.status} />
            <ShipmentInformation shipment={shipment} />
            <ShipmentStatusHistory history={shipment.history} />
          </>
        )}
      </div>
    </main>
  )
}

export default ShipmentDetailsPage
