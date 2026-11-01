import MetricCard from "../../../global/MetricCard"
import Statistics from "../utils/stats"

function DetailsCard({user, roleLabel}){
    const stats = Statistics(user, roleLabel)
    return (
        <div className="mb-5 grid grid-cols-1 gap-[11px] sm:grid-cols-3 sm:gap-3 lg:gap-[17px]">
          {stats.map((stat) => <MetricCard data-dashboard-stat key={stat.label} layout="dashboard" {...stat} />)}
        </div>
    )
}
export default DetailsCard