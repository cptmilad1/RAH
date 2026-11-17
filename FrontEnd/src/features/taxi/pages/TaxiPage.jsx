import i18n from '../../settings/locals/i18n.js'
import { useEffect } from 'react'
import { useAuthStore } from '../../auth/authStore'
import TaxiRequestForm from '../components/TaxiRequestForm'
import TaxiRideCard from '../components/TaxiRideCard'
import { useTaxiStore } from '../hooks/taxiStore'

function TaxiPage() {
  const role = useAuthStore((state) => state.user?.role || 'user')
  const {
    rides,
    availableRides,
    availability,
    vipFare,
    loading,
    saving,
    savingRideId,
    error,
    loadForRole,
    setAvailability,
    createRide,
    acceptRide,
    rejectRide,
    updateRideStatus,
    cancelRide,
    rateRide,
  } = useTaxiStore()

  useEffect(() => {
    loadForRole(role)
  }, [loadForRole, role])

  function confirmCancel(rideId) {
    if (window.confirm(i18n.t('taxi.confirm.cancel'))) cancelRide(rideId, role)
  }

  const heading = role === 'driver' ? 'taxi.driver.title' : 'taxi.title'

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.16),transparent_34%),#f5f7f1] px-4 py-6 text-[#17352e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe8df] pb-5">
          <div>
            <p className="mb-1 text-xs font-bold text-[#71867c]">{i18n.t('taxi.eyebrow')}</p>
            <h1 className="m-0 text-2xl font-black">{i18n.t(heading)}</h1>
            <p className="mb-0 mt-2 text-sm text-[#7b8982]">{i18n.t(role === 'driver' ? 'taxi.driver.subtitle' : 'taxi.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {role === 'driver' && <button
              type="button"
              disabled={saving}
              onClick={() => setAvailability(availability.isOnline
                ? { isOnline: false, isAvailable: false }
                : { isOnline: true, isAvailable: true })}
              className={`min-h-10 rounded-lg px-4 text-xs font-bold ${availability.isOnline ? 'bg-[#f0f4eb] text-[#315d49]' : 'bg-[#315d49] text-white'} disabled:opacity-60`}
            >{i18n.t(availability.isOnline ? 'taxi.driver.goOffline' : 'taxi.driver.goOnline')}</button>}
            <button type="button" onClick={() => loadForRole(role)} disabled={loading} className="min-h-10 rounded-lg border border-[#dfe8df] bg-white px-4 text-xs font-bold text-[#315d49] disabled:opacity-60">{i18n.t(loading ? 'taxi.loading' : 'taxi.refresh')}</button>
          </div>
        </header>

        {error && <p role="alert" className="mb-0 mt-5 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{i18n.t(error)}</p>}

        {role === 'user' && <TaxiRequestForm vipFare={vipFare} saving={saving} onSubmit={createRide} />}

        {role === 'driver' && <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-extrabold">{i18n.t('taxi.driver.available')}</h2>
              <p className="mb-0 mt-1 text-xs text-[#829188]">{i18n.t('taxi.driver.availableDescription')}</p>
            </div>
            <span className="text-xs text-[#829188]">{availableRides.length}</span>
          </div>
          <p className="mb-0 mt-2 text-xs text-[#829188]">{i18n.t(availability.isAvailable ? 'taxi.driver.statusAvailable' : 'taxi.driver.statusUnavailable')}</p>
          {availableRides.length ? <div className="mt-2 divide-y divide-[#e3eae2]">
            {availableRides.map((ride) => <TaxiRideCard
              key={ride.id}
              ride={ride}
              role={role}
              available
              saving={savingRideId === String(ride.id)}
              onAccept={acceptRide}
              onReject={rejectRide}
              onCancel={confirmCancel}
            />)}
          </div> : <p className="py-8 text-sm text-[#829188]">{i18n.t(loading ? 'taxi.loading' : 'taxi.empty.available')}</p>}
        </section>}

        <section className="mt-7 border-t border-[#dfe8df] pt-5">
          <h2 className="m-0 text-lg font-extrabold">{i18n.t(role === 'driver' ? 'taxi.driver.trips' : 'taxi.history')}</h2>
          {loading && rides.length === 0 ? <p className="py-8 text-sm text-[#829188]">{i18n.t('taxi.loading')}</p> : rides.length ? (
            <div className="mt-2 divide-y divide-[#e3eae2]">
              {rides.map((ride) => <TaxiRideCard
                key={ride.id}
                ride={ride}
                role={role}
                saving={savingRideId === String(ride.id)}
                onStatus={updateRideStatus}
                onCancel={confirmCancel}
                onRate={rateRide}
              />)}
            </div>
          ) : <p className="py-8 text-sm text-[#829188]">{i18n.t(role === 'driver' ? 'taxi.empty.driverTrips' : 'taxi.empty.history')}</p>}
        </section>
      </div>
    </main>
  )
}

export default TaxiPage