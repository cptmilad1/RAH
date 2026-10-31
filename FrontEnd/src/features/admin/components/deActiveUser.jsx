import getUserActions from "./utils/getUserAction"

function DeactiveUser({ user, updating, isCurrentUser, onSetRole, onApprove, onReject, onSetActive }) {
        const actionClass = 'min-h-10 rounded-xl px-4 text-xs font-extrabold disabled:cursor-wait disabled:opacity-60'
        const actions = getUserActions({ user, updating, isCurrentUser, onSetRole, onApprove, onReject, onSetActive })
    return (
        <div className="flex flex-wrap gap-2 text-2xl">
          {actions.map((action) => <button key={action.label} type="button" disabled={action.disabled} onClick={action.onClick} className={`${actionClass} ${action.className}`}>{action.label}</button>)}
        </div>
    )
}
export default DeactiveUser