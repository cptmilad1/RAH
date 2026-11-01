import { Link } from 'react-router-dom'
import { formatShipmentDate, statusLabels } from '../shipmentConstants'
import Card from '../../../global/Card'
import UserProfileLink from '../../../global/UserProfileLink'

function ShipmentCard({ shipment, canCancel, onCancel }) {
  const statusClass = shipment.status === 'delivered'
    ? 'bg-[#e9f5e5] text-[#4c8046]'
    : shipment.status === 'cancelled'
      ? 'bg-[#f8e9e5] text-[#a85848]'
      : 'bg-[#f4f3df] text-[#887b3d]'

  return (
    <Card as="article" data-shipment-card variant="interactive" className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eff4e8] text-xl text-[#547460]">▣</span>
          <div className="min-w-0">
            <Link to={`/shipments/${encodeURIComponent(shipment.trackingCode)}`} className="block truncate font-mono text-sm font-black text-[#214536] no-underline hover:text-[#668744]" dir="ltr">{shipment.trackingCode}</Link>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8b9790]">
              <span>{formatShipmentDate(shipment.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span>گیرنده:</span>
              <UserProfileLink
                userId={shipment.receiverId}
                name={shipment.receiverName || '—'}
                image={shipment.receiverImage}
                imageClassName="size-6"
                nameClassName="font-semibold text-[#547460]"
              />
            </span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusClass}`}>{statusLabels[shipment.status] || shipment.status}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="min-w-0"><span className="block text-[10px] text-[#99a39d]">مبدأ</span><strong className="mt-1 block truncate text-sm font-bold">{shipment.pickupProvince || '—'}</strong></div>
        <span aria-hidden="true" className="hidden text-[#a5b297] sm:block">←</span>
        <div className="min-w-0"><span className="block text-[10px] text-[#99a39d]">مقصد</span><strong className="mt-1 block truncate text-sm font-bold">{shipment.deliveryProvince || '—'}</strong></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f2ed] pt-3">
        <Link to={`/shipments/${encodeURIComponent(shipment.trackingCode)}`} className="text-xs font-bold text-[#547460] no-underline hover:text-[#1c5942]">جزئیات و رهگیری ←</Link>
        {canCancel && ['created', 'assigned'].includes(shipment.status) && <button type="button" onClick={() => onCancel(shipment)} className="text-xs font-bold text-[#ab6253] hover:text-[#803c30]">لغو مرسوله</button>}
      </div>
    </Card>
  )
}

export default ShipmentCard
