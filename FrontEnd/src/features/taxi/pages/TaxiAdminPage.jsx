import i18n from '../../settings/locals/i18n.js'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTaxiStore } from '../hooks/taxiStore'
import { vipFareSchema } from '../schema/taxiSchema'
import TaxiRideCard from '../components/TaxiRideCard'

function TaxiAdminPage() {
  const { rides, drivers, vipFare, loading, saving, savingRideId, error, loadAdmin, saveVipFare, cancelRide } = useTaxiStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(vipFareSchema),
    defaultValues: { fare: 0 },
  })

  useEffect(() => { loadAdmin() }, [loadAdmin])
  useEffect(() => { reset({ fare: vipFare }) }, [reset, vipFare])

  function confirmCancel(rideId) {
    if (window.confirm(i18n.t('taxi.confirm.cancel'))) cancelRide(rideId, 'admin')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_84%_-8%,rgba(215,243,106,.16),transparent_34%),#f5f7f1] px-4 py-6 text-[#17352e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-[1240px]">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe8df] pb-5">
          <div>
            <p className="mb-1 text-xs font-bold text-[#71867c]">{i18n.t('taxi.admin.eyebrow')}</p>
            <h1 className="m-0 text-2xl font-black">{i18n.t('taxi.admin.title')}</h1>
          </div>
          <button type="button" disabled={loading} onClick={loadAdmin} className="min-h-10 rounded-lg border border-[#dfe8df] bg-white px-4 text-xs font-bold text-[#315d49] disabled:opacity-60">{i18n.t('taxi.refresh')}</button>
        </header>
        {error && <p role="alert" className="mb-0 mt-5 rounded-xl border border-[#f0d7d0] bg-[#fff7f4] px-4 py-3 text-sm text-[#a94f3d]">{i18n.t(error)}</p>}

        <form onSubmit={handleSubmit((values) => saveVipFare(values.fare))} className="mt-5 grid gap-3 border-b border-[#dfe8df] pb-6 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end">
          <div>
            <h2 className="m-0 text-base font-extrabold">{i18n.t('taxi.admin.vipFare')}</h2>
            <p className="mb-0 mt-1 text-xs text-[#829188]">{i18n.t('taxi.admin.vipFareDescription')}</p>
          </div>
          <label className="grid gap-2 text-xs font-bold text-[#66776d]">
            {i18n.t('taxi.fixedFare')} (AFN)
            <input {...register('fare', { valueAsNumber: true })} type="number" min="1" step="1" className="min-h-10 rounded-lg border border-[#dfe8df] bg-white px-3 text-sm font-normal" />
            {errors.fare && <span role="alert" className="text-[#a94f3d]">{i18n.t(errors.fare.message)}</span>}
          </label>
          <button type="submit" disabled={saving} className="min-h-10 rounded-lg bg-[#315d49] px-4 text-xs font-extrabold text-white disabled:opacity-60">{i18n.t(saving ? 'taxi.admin.savingFare' : 'taxi.admin.saveFare')}</button>
        </form>

        <section className="mt-6">
          <h2 className="m-0 text-lg font-extrabold">{i18n.t('taxi.admin.drivers')}</h2>
          {drivers.length ? <div className="mt-3 overflow-x-auto border-y border-[#dfe8df]">
            <table className="w-full min-w-[720px] text-right text-xs">
              <thead className="text-[#829188]"><tr>
                <th className="py-3 font-semibold">{i18n.t('taxi.driver')}</th>
                <th className="py-3 font-semibold">{i18n.t('taxi.admin.availability')}</th>
                <th className="py-3 font-semibold">{i18n.t('taxi.vehicle')}</th>
                <th className="py-3 font-semibold">{i18n.t('taxi.admin.tripCount')}</th>
              </tr></thead>
              <tbody className="divide-y divide-[#e7ece5]">
                {drivers.map((driver) => <tr key={driver.userId}>
                  <td className="py-3"><strong>{driver.name}</strong><span className="block pt-1 text-[#829188]">{driver.email}</span></td>
                  <td className="py-3">{i18n.t(driver.isOnline ? 'taxi.admin.online' : 'taxi.admin.offline')} · {i18n.t(driver.isAvailable ? 'taxi.admin.available' : 'taxi.admin.unavailable')}</td>
                  <td className="py-3">{[driver.vehicleMake, driver.vehicleModel, driver.vehicleYear, driver.vehicleColor, driver.plateNumber].filter(Boolean).join(' · ') || i18n.t('taxi.vehicleDetailsUnavailable')}</td>
                  <td className="py-3">{driver.taxiTrips}</td>
                </tr>)}
              </tbody>
            </table>
          </div> : <p className="py-6 text-sm text-[#829188]">{i18n.t(loading ? 'taxi.loading' : 'taxi.admin.noDrivers')}</p>}
        </section>

        <section className="mt-7 border-t border-[#dfe8df] pt-5">
          <h2 className="m-0 text-lg font-extrabold">{i18n.t('taxi.admin.requests')}</h2>
          {rides.length ? <div className="mt-2 divide-y divide-[#e3eae2]">
            {rides.map((ride) => <TaxiRideCard key={ride.id} ride={ride} role="admin" saving={savingRideId === String(ride.id)} onCancel={confirmCancel} />)}
          </div> : <p className="py-6 text-sm text-[#829188]">{i18n.t(loading ? 'taxi.loading' : 'taxi.empty.admin')}</p>}
        </section>
      </div>
    </main>
  )
}

export default TaxiAdminPage