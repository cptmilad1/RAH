import { create } from 'zustand'
import { acceptDriverParcel, getAvailableDriverParcels } from './driverParcelsApi'

export const useDriverParcelsStore = create((set, get) => ({
  parcels: [],
  province: '',
  loading: false,
  acceptingCode: '',
  error: '',
  notice: '',
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
    set({ acceptingCode: trackingCode, error: '', notice: '' })
    try {
      await acceptDriverParcel(trackingCode)
      set({
        parcels: get().parcels.filter((parcel) => parcel.trackingCode !== trackingCode),
        notice: `مرسولهٔ ${trackingCode} به شما واگذار شد.`,
      })
      return true
    } catch (error) {
      set({ error: error.message || 'قبول مرسوله ناموفق بود.' })
      return false
    } finally {
      set({ acceptingCode: '' })
    }
  },
  clearMessages: () => set({ error: '', notice: '' }),
}))