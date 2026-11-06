import { localizeText } from '../../settings/locals/localizedText.js'
function DriverApplicationField({ label, error, ...inputProps }) {
  return (
    <label className="grid gap-2 text-xs font-bold text-[#66776d]">
      {localizeText(label)}
      <input {...inputProps} className="min-h-11 rounded-xl border border-[#e2e8de] bg-white px-3 text-sm font-normal text-[#17352e] outline-none focus:border-[#9dbb87] focus:ring-4 focus:ring-[#82aa85]/[0.12]" />
      {error && <span className="font-normal text-[#a94f3d]">{localizeText(error)}</span>}
    </label>
  )
}

export default DriverApplicationField
