import { create } from 'zustand'
import { acceptDriverParcel, getAvailableDriverParcels } from '../api/driverParcelsApi'
import { toast } from '../../../global/toast/toastStore'

export const useDriverParcelsStore = create((set, get) => ({
  parcels: [],
  province: '',
  loading: false,
  acceptingCode: '',
  error: '',
  fetchParcels: async () => {
    set({ loading: true, error: '' })
    try {
      const result = await getAvailableDriverParcels()
      set({ parcels: result.parcels, province: result.driverProvince })
    } catch (error) {
      set({ error: error.message || 'دریافت مرسوله‌های قابل قبول ناموفق بود.' })
    } finally {
      set({ loading: false })
    }
  },
  acceptParcel: async (trackingCode) => {
    set({ acceptingCode: trackingCode, error: '' })
    try {
      await acceptDriverParcel(trackingCode)
      set({
        parcels: get().parcels.filter((parcel) => parcel.trackingCode !== trackingCode),
      })
      toast.success('toast.parcelAccepted', { values: { trackingCode } })
      return true
    } catch (error) {
      set({ error: error.message || 'قبول مرسوله ناموفق بود.' })
      return false
    } finally {
      set({ acceptingCode: '' })
    }
  },
  clearMessages: () => set({ error: '' }),
}))