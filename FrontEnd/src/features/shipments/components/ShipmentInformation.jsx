import Card from '../../../global/Card'
import UserProfileLink from '../../../global/UserProfileLink'

function ShipmentInformation({ shipment }) {
  return (
    <Card as="section" variant="unstyled" className="mt-5 grid gap-4 rounded-[24px] border border-[#e5ebe3] bg-white p-5 sm:grid-cols-2 sm:p-7">
      <div>
        <span className="text-[11px] text-[#8c9991]">فرستنده</span>
        <UserProfileLink userId={shipment.senderId} name={shipment.senderName || '—'} image={shipment.senderImage} imageClassName="size-10" nameClassName="text-sm font-bold text-[#244b39]" className="mt-2" />
      </div>
      <div>
        <span className="text-[11px] text-[#8c9991]">گیرنده</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <UserProfileLink userId={shipment.receiverId} name={shipment.receiverName || '—'} image={shipment.receiverImage} imageClassName="size-10" nameClassName="text-sm font-bold text-[#244b39]" />
          <span dir="ltr" className="text-xs text-[#84918a]">{shipment.receiverPhone || ''}</span>
        </div>
      </div>
      {shipment.driverName && <div>
        <span className="text-[11px] text-[#8c9991]">راننده</span>
        <UserProfileLink userId={shipment.driverId} name={shipment.driverName} image={shipment.driverImage} imageClassName="size-10" nameClassName="text-sm font-bold text-[#244b39]" className="mt-2" />
      </div>}
      <div className="rounded-2xl bg-[#f7f9f4] p-4"><span className="text-[11px] text-[#8c9991]">مبدأ · {shipment.pickupProvince}</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.pickupAddress}</p></div>
      <div className="rounded-2xl bg-[#f7f9f4] p-4"><span className="text-[11px] text-[#8c9991]">مقصد · {shipment.deliveryProvince}</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.deliveryAddress}</p></div>
      {shipment.description && <div className="sm:col-span-2"><span className="text-[11px] text-[#8c9991]">توضیحات</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.description}</p></div>}
    </Card>
  )
}

export default ShipmentInformation
