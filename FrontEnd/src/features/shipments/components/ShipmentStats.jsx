import i18n from '../../settings/locals/i18n.js'
import MetricCard from '../../../global/MetricCard'

function ShipmentStats({ stats, loading }) {
  const number = (value) => loading ? '…' : value.toLocaleString('fa-IR')

  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-3">
      <MetricCard label={i18n.t("کل مرسوله‌ها")} value={number(stats.total)} caption={i18n.t("آخرین ۱۰۰ مرسولهٔ ثبت‌شده")} />
      <MetricCard label={i18n.t("در جریان")} value={number(stats.active)} caption={i18n.t("از ثبت تا تحویل نهایی")} variant="highlight" />
      <MetricCard label={i18n.t("تحویل موفق")} value={number(stats.delivered)} caption={i18n.t("رسیده به مقصد")} />
    </div>
  )
}

export default ShipmentStats
