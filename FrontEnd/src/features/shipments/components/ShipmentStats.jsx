import MetricCard from '../../../global/MetricCard'

function ShipmentStats({ stats, loading }) {
  const number = (value) => loading ? '…' : value.toLocaleString('fa-IR')

  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-3">
      <MetricCard label="کل مرسوله‌ها" value={number(stats.total)} caption="آخرین ۱۰۰ مرسولهٔ ثبت‌شده" />
      <MetricCard label="در جریان" value={number(stats.active)} caption="از ثبت تا تحویل نهایی" variant="highlight" />
      <MetricCard label="تحویل موفق" value={number(stats.delivered)} caption="رسیده به مقصد" />
    </div>
  )
}

export default ShipmentStats
