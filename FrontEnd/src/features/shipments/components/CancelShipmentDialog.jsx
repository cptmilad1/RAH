import { localizeText } from '../../settings/locals/localizedText.js'
function CancelShipmentDialog({ shipment, reason, error, onReasonChange, onSubmit, onClose }) {
  if (!shipment) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#09251f]/55 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
        <h2 className="m-0 text-lg font-black">{localizeText("لغو مرسوله")}</h2>
        <p className="mt-2 text-sm leading-6 text-[#7b8982]">{localizeText("برای ثبت لغو")}{' '}{localizeText(shipment.trackingCode)}{localizeText("، دلیل را بنویس.")}</p>
        <textarea required maxLength={500} rows={3} value={localizeText(reason)} onChange={(event) => onReasonChange(event.target.value)} className="mt-3 w-full rounded-xl border border-[#e2e8de] p-3 text-sm" placeholder={localizeText("دلیل لغو...")} />
        {error && <p role="alert" className="text-xs text-[#a94f3d]">{localizeText(error)}</p>}
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-[#e2e8de] px-4 py-2.5 text-sm font-bold">{localizeText("بازگشت")}</button>
          <button type="submit" className="rounded-xl bg-[#a94f3d] px-4 py-2.5 text-sm font-bold text-white">{localizeText("تأیید لغو")}</button>
        </div>
      </form>
    </div>
  )
}

export default CancelShipmentDialog
