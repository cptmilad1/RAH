import { localizeText } from '../../settings/locals/localizedText.js'
import { afghanistanProvinces } from '../shipmentConstants'

function AddressFields({ section, title, addressLabel, value, onChange }) {
  return (
    <fieldset className="grid content-start gap-3 rounded-2xl border border-[#e8ede5] bg-white p-4">
      <legend className="px-1 text-sm font-extrabold text-[#31513e]">{localizeText(title)}</legend>
      <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("ولایت")}<select required value={localizeText(value.province)} onChange={(event) => onChange(section, 'province', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-2.5 text-sm font-normal text-[#17352e]">
          <option value="">{localizeText("انتخاب ولایت")}</option>
          {afghanistanProvinces.map((province) => <option key={province} value={localizeText(province)}>{localizeText(province)}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText(addressLabel)}<textarea required maxLength={2000} rows={3} value={localizeText(value.addressLine)} onChange={(event) => onChange(section, 'addressLine', event.target.value)} className="resize-y rounded-xl border border-[#e2e8de] px-3 py-2.5 text-sm font-normal" /></label>
    </fieldset>
  )
}

function CreateShipmentDialog({ open, onClose, form, onChange, onSubmit, saving, error }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#09251f]/55 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-shipment-title" className="my-auto w-full max-w-2xl rounded-[24px] bg-[#fbfcf9] p-5 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><span className="text-[11px] font-bold text-[#7b8b7f]">{localizeText("ارسال تازه")}</span><h2 id="create-shipment-title" className="mb-0 mt-1 text-xl font-black">{localizeText("مشخصات مرسوله را وارد کن")}</h2></div>
          <button type="button" aria-label={localizeText("بستن")} onClick={onClose} className="grid size-9 place-items-center rounded-xl bg-[#edf1e9] text-lg text-[#5d7065]">×</button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-5">
          <fieldset className="grid gap-3 border-0 p-0">
            <legend className="mb-3 text-sm font-extrabold text-[#31513e]">{localizeText("اطلاعات گیرنده")}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("نام و نام خانوادگی")}<input required maxLength={100} value={localizeText(form.receiver.name)} onChange={(event) => onChange('receiver', 'name', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-3 text-sm font-normal text-[#17352e]" placeholder={localizeText("نام گیرنده")} /></label>
              <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("شمارهٔ تماس")}<input required maxLength={30} inputMode="tel" value={localizeText(form.receiver.phone)} onChange={(event) => onChange('receiver', 'phone', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-3 text-sm font-normal text-[#17352e]" placeholder="09..." /></label>
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <AddressFields section="pickup" title={localizeText("مبدأ")} addressLabel={localizeText("آدرس کامل مبدأ")} value={localizeText(form.pickup)} onChange={onChange} />
            <AddressFields section="delivery" title={localizeText("مقصد")} addressLabel={localizeText("آدرس کامل مقصد")} value={localizeText(form.delivery)} onChange={onChange} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("نام کالا")}<input maxLength={150} value={localizeText(form.itemName)} onChange={(event) => onChange(null, 'itemName', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-2.5 text-sm font-normal" /></label>
            <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("تعداد")}<input type="number" min="1" max="10000" value={localizeText(form.quantity)} onChange={(event) => onChange(null, 'quantity', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-2.5 text-sm font-normal" /></label>
            <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("وزن تقریبی (کیلوگرم)")}<input type="number" min="0.01" step="0.01" value={localizeText(form.weightKg)} onChange={(event) => onChange(null, 'weightKg', event.target.value)} className="rounded-xl border border-[#e2e8de] bg-white px-3 py-2.5 text-sm font-normal" /></label>
          </div>
          <label className="grid gap-2 text-xs font-bold text-[#66776d]">{localizeText("توضیحات")}<textarea maxLength={2000} rows={2} value={localizeText(form.description)} onChange={(event) => onChange(null, 'description', event.target.value)} className="resize-y rounded-xl border border-[#e2e8de] bg-white px-3 py-2.5 text-sm font-normal" /></label>
          {error && <p role="alert" className="m-0 text-xs text-[#a94f3d]">{localizeText(error)}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#e9ede6] pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#e2e8de] px-5 py-3 text-sm font-bold text-[#65756b]">{localizeText("انصراف")}</button>
            <button disabled={saving} type="submit" className="rounded-xl bg-[#173f32] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60">{localizeText(saving ? 'در حال ثبت…' : 'ثبت مرسوله')}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CreateShipmentDialog
