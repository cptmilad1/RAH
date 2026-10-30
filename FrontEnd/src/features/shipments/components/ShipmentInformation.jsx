function ShipmentInformation({ shipment }) {
  return (
    <section className="mt-5 grid gap-4 rounded-[24px] border border-[#e5ebe3] bg-white p-5 sm:grid-cols-2 sm:p-7">
      <div><span className="text-[11px] text-[#8c9991]">فرستنده</span><p className="mb-0 mt-2 text-sm font-bold">{shipment.senderName || '—'}</p></div>
      <div><span className="text-[11px] text-[#8c9991]">گیرنده</span><p className="mb-0 mt-2 text-sm font-bold">{shipment.receiverName || '—'} <span dir="ltr" className="mr-2 text-xs font-normal text-[#84918a]">{shipment.receiverPhone || ''}</span></p></div>
      <div className="rounded-2xl bg-[#f7f9f4] p-4"><span className="text-[11px] text-[#8c9991]">مبدأ · {shipment.pickupProvince}</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.pickupAddress}</p></div>
      <div className="rounded-2xl bg-[#f7f9f4] p-4"><span className="text-[11px] text-[#8c9991]">مقصد · {shipment.deliveryProvince}</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.deliveryAddress}</p></div>
      {shipment.description && <div className="sm:col-span-2"><span className="text-[11px] text-[#8c9991]">توضیحات</span><p className="mb-0 mt-2 text-sm leading-7">{shipment.description}</p></div>}
    </section>
  )
}

export default ShipmentInformation
