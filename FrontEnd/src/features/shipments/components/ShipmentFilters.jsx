import { shipmentFilters } from '../shipmentConstants'

function ShipmentFilters({ activeFilter, onFilterChange, search, onSearchChange }) {
  return (
    <div className="border-b border-[#edf0eb] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-extrabold">تاریخچهٔ ارسال</h2>
          <p className="mb-0 mt-1 text-xs text-[#84918a]">وضعیت و جزئیات هر مرسوله را دنبال کن.</p>
        </div>
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-[#e7ece5] bg-[#f9faf7] px-3 py-2.5 sm:max-w-[300px]">
          <span aria-hidden="true" className="text-[#829188]">⌕</span>
          <input aria-label="جست‌وجو در مرسوله‌ها" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="کد رهگیری، شهر یا گیرنده..." className="w-full border-0 bg-transparent text-xs outline-none placeholder:text-[#9aa59f]" />
        </label>
      </div>
      <div role="tablist" aria-label="فیلتر وضعیت" className="flex gap-2 overflow-x-auto pb-1">
        {shipmentFilters.map((filter) => (
          <button key={filter.id} type="button" role="tab" aria-selected={activeFilter === filter.id} onClick={() => onFilterChange(filter.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${activeFilter === filter.id ? 'bg-[#173f32] text-white' : 'bg-[#f3f5f0] text-[#728078] hover:bg-[#ebf0e5]'}`}>{filter.label}</button>
        ))}
      </div>
    </div>
  )
}

export default ShipmentFilters
