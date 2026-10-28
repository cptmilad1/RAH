import ShipmentCard from './ShipmentCard'

function EmptyShipments({ hasShipments, onCreate }) {
  return (
    <div className="grid min-h-64 justify-items-center content-center px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#eff4e8] text-2xl text-[#66845e]">▣</span>
      <h3 className="mb-1 mt-4 text-base font-extrabold">{hasShipments ? 'مرسوله‌ای پیدا نشد' : 'هنوز مرسوله‌ای ثبت نکرده‌ای'}</h3>
      <p className="mb-4 max-w-sm text-xs leading-6 text-[#84918a]">{hasShipments ? 'عبارت جست‌وجو یا فیلتر وضعیت را تغییر بده.' : 'اولین مرسوله‌ات را ثبت کن تا بتوانی مسیرش را همین‌جا دنبال کنی.'}</p>
      {!hasShipments && <button type="button" onClick={onCreate} className="rounded-xl bg-[#173f32] px-4 py-2.5 text-xs font-bold text-white">ثبت مرسولهٔ اول</button>}
    </div>
  )
}

function ShipmentList({ shipments, allShipments, loading, error, onRetry, onCreate, user, onCancel }) {
  if (loading) {
    return <div className="grid min-h-56 place-items-center text-sm text-[#829188]"><span className="animate-pulse">در حال دریافت مرسوله‌ها…</span></div>
  }

  return (
    <>
      {error && <div role="alert" className="mx-4 mt-4 rounded-xl border border-[#f1d4ce] bg-[#fff5f2] px-4 py-3 text-sm text-[#a94f3d] sm:mx-6">{error}<button type="button" onClick={onRetry} className="mr-3 font-bold underline">تلاش دوباره</button></div>}
      {shipments.length ? (
        <div className="grid gap-3 p-4 sm:p-6">
          {shipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              canCancel={String(shipment.senderId) === String(user?.id) || user?.role === 'admin'}
              onCancel={onCancel}
            />
          ))}
        </div>
      ) : <EmptyShipments hasShipments={allShipments.length > 0} onCreate={onCreate} />}
    </>
  )
}

export default ShipmentList
