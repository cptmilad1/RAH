import i18n from '../../settings/locals/i18n.js'
import { Link } from 'react-router-dom'
import TaxiRatingForm from './TaxiRatingForm'

const statusKeys = {
  requested: 'taxi.status.pending',
  searching: 'taxi.status.pending',
  accepted: 'taxi.status.accepted',
  driver_arriving: 'taxi.status.driverArriving',
  arrived: 'taxi.status.driverArrived',
  driver_arrived: 'taxi.status.driverArrived',
  started: 'taxi.status.started',
  completed: 'taxi.status.completed',
  cancelled: 'taxi.status.cancelled',
}

const nextDriverStatus = {
  accepted: ['driver_arriving', 'taxi.action.driverArriving'],
  driver_arriving: ['driver_arrived', 'taxi.action.driverArrived'],
  driver_arrived: ['started', 'taxi.action.startTrip'],
  started: ['completed', 'taxi.action.completeTrip'],
}

function TaxiRideCard({ ride, role, available = false, saving, onAccept, onReject, onStatus, onCancel, onRate }) {
  const isPassenger = role === 'user'
  const canCancel = role === 'admin'
    ? !['completed', 'cancelled'].includes(ride.status)
    : role === 'driver'
      ? Boolean(ride.driverUserId) && !['completed', 'cancelled', 'started'].includes(ride.status)
      : role === 'user' && !['completed', 'cancelled', 'started'].includes(ride.status)
  const statusAction = role === 'driver' && nextDriverStatus[ride.status]

  return (
    <article className="border-b border-[#e3eae2] py-5 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold">{i18n.t(ride.taxiType === 'vip' ? 'taxi.type.vip' : 'taxi.type.standard')}</span>
            <span className="rounded-full bg-[#edf3e9] px-2.5 py-1 text-[11px] font-bold text-[#486a55]">{i18n.t(statusKeys[ride.status] || ride.status)}</span>
          </div>
          <p className="mb-0 mt-2 text-xs text-[#829188]">{i18n.t('taxi.requestedAt')} {ride.requestedAt ? new Date(ride.requestedAt).toLocaleString(i18n.language) : ''}</p>
        </div>
        <strong className="text-sm text-[#315d49]">{Number(ride.fare || 0).toLocaleString(i18n.language)} AFN</strong>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div><dt className="text-[11px] text-[#829188]">{i18n.t('taxi.pickup')}</dt><dd className="mb-0 mt-1 leading-6">{ride.pickupAddress}</dd></div>
        <div><dt className="text-[11px] text-[#829188]">{i18n.t('taxi.destination')}</dt><dd className="mb-0 mt-1 leading-6">{ride.destinationAddress}</dd></div>
      </dl>
      {ride.note && <p className="mb-0 mt-3 text-xs leading-6 text-[#71867c]">{i18n.t('taxi.note')}: {ride.note}</p>}

      {(ride.driverName || ride.passengerName) && (
        <div className="mt-4 grid gap-3 rounded-xl bg-[#f5f7f2] p-3 text-xs sm:grid-cols-2">
          {ride.driverName && <div>
            <span className="text-[#829188]">{i18n.t('taxi.driver')}: </span>
            <Link to={`/profile/${ride.driverUserId}`} className="font-bold text-[#315d49]">{ride.driverName}</Link>
            <p className="mb-0 mt-1 text-[#66776d]">
              {[ride.vehicleType, ride.vehicleMake, ride.vehicleModel, ride.vehicleYear, ride.vehicleColor, ride.plateNumber].filter(Boolean).join(' · ') || i18n.t('taxi.vehicleDetailsUnavailable')}
            </p>
          </div>}
          {(ride.passengerName && role !== 'user') && <div>
            <span className="text-[#829188]">{i18n.t('taxi.passenger')}: </span>
            <Link to={`/profile/${ride.passengerId}`} className="font-bold text-[#315d49]">{ride.passengerName}</Link>
          </div>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {available && <>
          <button type="button" disabled={saving} onClick={() => onAccept(ride.id)} className="min-h-10 rounded-lg bg-[#315d49] px-4 text-xs font-bold text-white disabled:opacity-60">{i18n.t('taxi.action.accept')}</button>
          <button type="button" disabled={saving} onClick={() => onReject(ride.id)} className="min-h-10 rounded-lg border border-[#dfe8df] px-4 text-xs font-bold text-[#66776d] disabled:opacity-60">{i18n.t('taxi.action.reject')}</button>
        </>}
        {statusAction && <button type="button" disabled={saving} onClick={() => onStatus(ride.id, statusAction[0])} className="min-h-10 rounded-lg bg-[#315d49] px-4 text-xs font-bold text-white disabled:opacity-60">{i18n.t(statusAction[1])}</button>}
        {canCancel && ['user', 'driver', 'admin'].includes(role) && <button type="button" disabled={saving} onClick={() => onCancel(ride.id)} className="min-h-10 rounded-lg border border-[#edd9d4] px-4 text-xs font-bold text-[#a94f3d] disabled:opacity-60">{i18n.t('taxi.action.cancel')}</button>}
        {ride.driverUserId && isPassenger && <Link to={`/messages/${ride.driverUserId}`} className="inline-flex min-h-10 items-center rounded-lg border border-[#dfe8df] px-4 text-xs font-bold text-[#315d49] no-underline">{i18n.t('taxi.action.messageDriver')}</Link>}
        {ride.driverUserId && role === 'driver' && <Link to={`/messages/${ride.passengerId}`} className="inline-flex min-h-10 items-center rounded-lg border border-[#dfe8df] px-4 text-xs font-bold text-[#315d49] no-underline">{i18n.t('taxi.action.messagePassenger')}</Link>}
      </div>

      {isPassenger && ride.status === 'completed' && !ride.ratingId && (
        <TaxiRatingForm saving={saving} onSubmit={(rating) => onRate(ride.id, rating)} />
      )}
      {isPassenger && ride.ratingId && <p className="mb-0 mt-3 text-xs font-bold text-[#486a55]">{i18n.t('taxi.rating.saved')} · {ride.ratingScore}/5</p>}
    </article>
  )
}

export default TaxiRideCard