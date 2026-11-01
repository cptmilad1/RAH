import MetricCard from "../../../global/MetricCard"
import Stats from "../utils/stats"

function DetailsCard({ users }) {
      const stats = Stats(users)
    return(
        <section aria-label="آمار سامانه" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => <MetricCard data-admin-stat key={stat.label} layout="header" label={stat.label} value={stat.value} icon={stat.icon} iconClassName={stat.tone} />)}
        </section>
    )
}
export default DetailsCard