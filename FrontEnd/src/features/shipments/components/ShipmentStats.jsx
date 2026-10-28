function StatCard({ label, value, caption, highlighted = false }) {
  const cardClass = highlighted
    ? 'border-[#dce9c0] bg-[#edf6d8]'
    : 'border-[#e5ebe3] bg-white/85 shadow-[0_8px_24px_rgba(22,57,43,.035)]'

  return (
    <article className={`rounded-2xl border p-5 ${cardClass}`}>
      <p className={`m-0 text-xs ${highlighted ? 'text-[#627a4d]' : 'text-[#7b8982]'}`}>{label}</p>
      <strong className={`mt-3 block text-3xl font-black ${highlighted ? 'text-[#315638]' : ''}`}>{value}</strong>
      <span className={`mt-2 block text-[11px] ${highlighted ? 'text-[#71845e]' : 'text-[#95a098]'}`}>{caption}</span>
    </article>
  )
}

function ShipmentStats({ stats, loading }) {
  const number = (value) => loading ? '…' : value.toLocaleString('fa-IR')

  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-3">
      <StatCard label="کل مرسوله‌ها" value={number(stats.total)} caption="آخرین ۱۰۰ مرسولهٔ ثبت‌شده" />
      <StatCard label="در جریان" value={number(stats.active)} caption="از ثبت تا تحویل نهایی" highlighted />
      <StatCard label="تحویل موفق" value={number(stats.delivered)} caption="رسیده به مقصد" />
    </div>
  )
}

export default ShipmentStats
