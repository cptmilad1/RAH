import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '../auth/authStore'
import { usePresenceStore } from '../presence/presenceStore'
import ShipmentConversation from './components/ShipmentConversation'
import ShipmentDetailsHeader from './components/ShipmentDetailsHeader'
import ShipmentInformation from './components/ShipmentInformation'
import ShipmentStatusHistory from './components/ShipmentStatusHistory'
import {
  confirmShipmentDelivery,
  confirmShipmentHandoff,
  getShipment,
  updateShipmentStatus,
} from './shipmentsApi'

function ShipmentDetailsPage() {
  const { trackingCode } = useParams()
  const user = useAuthStore((state) => state.user)
  const socket = usePresenceStore((state) => state.socket)
  const [result, setResult] = useState(null)
  const [actionError, setActionError] = useState('')
  const [realtimeNotice, setRealtimeNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const refreshShipment = useCallback(() => {
    getShipment(trackingCode)
      .then((shipment) => { setResult({ trackingCode, shipment, error: '' }) })
      .catch((requestError) => {
        setResult({ trackingCode, shipment: null, error: requestError.message || 'دریافت جزئیات مرسوله ناموفق بود.' })
      })
  }, [trackingCode])

  useEffect(() => {
    refreshShipment()
  }, [refreshShipment])

  useEffect(() => {
    if (!socket) return undefined
    const handleParcelUpdate = (payload) => {
      if (payload.trackingCode !== trackingCode) return
      const noticeByStatus = {
        assigned: 'راننده مرسوله را پذیرفت.',
        picked_up: 'تحویل مرسوله به راننده تأیید شد.',
        in_transit: 'وضعیت مرسوله به «در مسیر» تغییر کرد.',
        delivery_pending_confirmation: 'راننده تحویل مرسوله را ثبت کرده؛ دریافت را تأیید کن.',
        delivered: 'دریافت نهایی مرسوله تأیید شد.',
      }
      setRealtimeNotice({
        trackingCode,
        message: noticeByStatus[payload.status] || 'وضعیت مرسوله به‌روزرسانی شد.',
      })
      refreshShipment()
    }
    socket.on('parcel:updated', handleParcelUpdate)
    return () => socket.off('parcel:updated', handleParcelUpdate)
  }, [socket, trackingCode, refreshShipment])

  async function runAction(action) {
    setSaving(true)
    setActionError('')
    try {
      await action()
      refreshShipment()
    } catch (error) {
      setActionError(error.message || 'به‌روزرسانی مرسوله ناموفق بود.')
    } finally {
      setSaving(false)
    }
  }

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
            {realtimeNotice?.trackingCode === trackingCode && <p role="status" className="mt-5 rounded-xl border border-[#dce9cf] bg-[#f2f8e9] p-4 text-sm font-bold text-[#557460]">{realtimeNotice.message}</p>}
            {shipment.isSender || shipment.isReceiver || shipment.isAssignedDriver || user?.role === 'admin' || user?.role === 'driver'
              ? <ShipmentInformation shipment={shipment} />
              : <p className="mt-5 rounded-2xl border border-[#e5ebe3] bg-white p-5 text-sm leading-7 text-[#71867c]">این صفحه رهگیری عمومی است و فقط وضعیت و تاریخچهٔ مرسوله را نشان می‌دهد.</p>}
            <ShipmentStatusHistory history={shipment.history} />
            {actionError && <p role="alert" className="mt-5 rounded-xl bg-[#fff5f2] p-4 text-sm text-[#a94f3d]">{actionError}</p>}
            {shipment.isSender && shipment.status === 'assigned' && (
              <button type="button" disabled={saving} onClick={() => runAction(() => confirmShipmentHandoff(trackingCode))} className="mt-5 w-full rounded-xl bg-[#173f32] px-5 py-3 font-bold text-white disabled:opacity-50">
                {saving ? 'در حال ثبت…' : 'تحویل مرسوله به راننده را تأیید می‌کنم'}
              </button>
            )}
            {shipment.isAssignedDriver && shipment.status === 'picked_up' && (
              <button type="button" disabled={saving} onClick={() => runAction(() => updateShipmentStatus(trackingCode, 'in_transit'))} className="mt-5 w-full rounded-xl bg-[#173f32] px-5 py-3 font-bold text-white disabled:opacity-50">
                {saving ? 'در حال ثبت…' : 'ثبت وضعیت «در مسیر»'}
              </button>
            )}
            {shipment.isAssignedDriver && shipment.status === 'in_transit' && (
              <button type="button" disabled={saving} onClick={() => runAction(() => updateShipmentStatus(trackingCode, 'delivery_pending_confirmation'))} className="mt-5 w-full rounded-xl bg-[#173f32] px-5 py-3 font-bold text-white disabled:opacity-50">
                {saving ? 'در حال ثبت…' : 'ثبت تحویل به گیرنده'}
              </button>
            )}
            {(shipment.isSender || shipment.isReceiver) && shipment.status === 'delivery_pending_confirmation' && (
              <button type="button" disabled={saving} onClick={() => runAction(() => confirmShipmentDelivery(trackingCode))} className="mt-5 w-full rounded-xl bg-[#173f32] px-5 py-3 font-bold text-white disabled:opacity-50">
                {saving ? 'در حال ثبت…' : 'دریافت مرسوله را تأیید می‌کنم'}
              </button>
            )}
            {shipment.canChat && <ShipmentConversation trackingCode={trackingCode} />}
          </>
        )}
      </div>
    </main>
  )
}

export default ShipmentDetailsPage
