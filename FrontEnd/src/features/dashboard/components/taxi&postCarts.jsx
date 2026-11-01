import DashboardActionCard from "./utils/dashboardActions"
import Actions from "../utils/actions"

function PostCards({user, navigate}){
  const actions = Actions(user, navigate)
    return <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => <DashboardActionCard key={action.label} {...action} />)}
        </div>
}
export default PostCards