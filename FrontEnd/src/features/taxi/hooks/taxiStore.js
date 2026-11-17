import { create } from 'zustand'
import {
  acceptTaxiRide,
  cancelTaxiRide,
  createTaxiRide,
  getAvailableTaxiRides,
  getMyTaxiRides,
  getTaxiAvailability,
  getTaxiAdminDrivers,
  getTaxiAdminRides,
  getTaxiVipFare,
  rateTaxiRide,
  rejectTaxiRide,
  updateTaxiRideStatus,
  updateTaxiAvailability,
  updateTaxiVipFare,
} from '../api/taxiApi'
import { toast } from '../../../global/toast/toastStore'

export const useTaxiStore = create((set, get) => ({
  rides: [],
  availableRides: [],
  drivers: [],
  vipFare: 0,
  availability: { isOnline: false, isAvailable: false },
  loading: false,
  saving: false,
  savingRideId: null,
  error: '',
  loadForRole: async (role) => {
    set({ loading: true, error: '' })
    try {
      const [rides, availability, vipFare] = await Promise.all([
        getMyTaxiRides(),
        role === 'driver' ? getTaxiAvailability() : Promise.resolve({ isOnline: false, isAvailable: false }),
        getTaxiVipFare(),
      ])
      const availableRides = role === 'driver' && availability.isOnline && availability.isAvailable
        ? await getAvailableTaxiRides()
        : []
      set({ rides, availability, availableRides, vipFare })
    } catch (error) {
      set({ error: error.message || 'خطا در دریافت سفرهای تاکسی.' })
    } finally {
      set({ loading: false })
    }
  },
  loadAdmin: async () => {
    set({ loading: true, error: '' })
    try {
      const [rides, drivers, vipFare] = await Promise.all([
        getTaxiAdminRides(),
        getTaxiAdminDrivers(),
        getTaxiVipFare(),
      ])
      set({ rides, drivers, vipFare })
    } catch (error) {
      set({ error: error.message || 'خطا در دریافت اطلاعات تاکسی.' })
    } finally {
      set({ loading: false })
    }
  },
  createRide: async (payload) => {
    set({ saving: true, error: '' })
    try {
      const result = await createTaxiRide(payload)
      set({ rides: [result.ride, ...get().rides] })
      toast.success('taxi.toast.requestCreated')
      return result.ride
    } catch (error) {
      set({ error: error.message || 'خطا در ثبت درخواست تاکسی.' })
      return null
    } finally {
      set({ saving: false })
    }
  },
  performRideAction: async (rideId, action, role) => {
    set({ savingRideId: String(rideId), error: '' })
    try {
      await action(rideId)
      await get().loadForRole(role)
      return true
    } catch (error) {
      set({ error: error.message || 'عملیات سفر ناموفق بود.' })
      return false
    } finally {
      set({ savingRideId: null })
    }
  },
  acceptRide: (rideId) => get().performRideAction(rideId, acceptTaxiRide, 'driver'),
  rejectRide: (rideId) => get().performRideAction(rideId, rejectTaxiRide, 'driver'),
  updateRideStatus: (rideId, status) => get().performRideAction(
    rideId,
    (id) => updateTaxiRideStatus(id, status),
    'driver',
  ),
  cancelRide: (rideId, role) => get().performRideAction(rideId, cancelTaxiRide, role),
  rateRide: async (rideId, payload) => {
    set({ savingRideId: String(rideId), error: '' })
    try {
      await rateTaxiRide(rideId, payload)
      toast.success('taxi.toast.ratingSaved')
      await get().loadForRole('user')
      return true
    } catch (error) {
      set({ error: error.message || 'خطا در ثبت امتیاز.' })
      return false
    } finally {
      set({ savingRideId: null })
    }
  },
  saveVipFare: async (fare) => {
    set({ saving: true, error: '' })
    try {
      const vipFare = await updateTaxiVipFare(fare)
      set({ vipFare })
      toast.success('taxi.toast.vipFareSaved')
      return true
    } catch (error) {
      set({ error: error.message || 'خطا در ذخیرهٔ کرایهٔ VIP.' })
      return false
    } finally {
      set({ saving: false })
    }
  },
  setAvailability: async (nextAvailability) => {
    set({ saving: true, error: '' })
    try {
      await updateTaxiAvailability(nextAvailability)
      await get().loadForRole('driver')
      return true
    } catch (error) {
      set({ error: error.message || 'خطا در به‌روزرسانی وضعیت راننده.' })
      return false
    } finally {
      set({ saving: false })
    }
  },
}))