import { localizeText } from '../../settings/locals/localizedText.js'
import MetricCard from '../../../global/MetricCard'

function ShipmentStats({ stats, loading }) {
  const number = (value) => loading ? '…' : value.toLocaleString('fa-IR')

  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-3">
      <MetricCard label={localizeText("کل مرسوله‌ها")} value={localizeText(number(stats.total))} caption={localizeText("آخرین ۱۰۰ مرسولهٔ ثبت‌شده")} />
      <MetricCard label={localizeText("در جریان")} value={localizeText(number(stats.active))} caption={localizeText("از ثبت تا تحویل نهایی")} variant="highlight" />
      <MetricCard label={localizeText("تحویل موفق")} value={localizeText(number(stats.delivered))} caption={localizeText("رسیده به مقصد")} />
    </div>
  )
}

export default ShipmentStats
