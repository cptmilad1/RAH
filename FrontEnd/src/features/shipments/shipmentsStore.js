import { create } from 'zustand'
import { cancelShipment, createShipment, getShipments } from './shipmentsApi'

export const useShipmentsStore = create((set, get) => ({
  shipments: [],
  loading: false,
  saving: false,
  error: '',
  fetchShipments: async () => {
    set({ loading: true, error: '' })
    try {
      const shipments = await getShipments()
      set({ shipments })
    } catch (error) {
      set({ error: error.message || 'دریافت مرسوله‌ها ناموفق بود.' })
    } finally {
      set({ loading: false })
    }
  },
  addShipment: async (payload) => {
    set({ saving: true, error: '' })
    try {
      const shipment = await createShipment(payload)
      set({ shipments: [shipment, ...get().shipments] })
      return shipment
    } catch (error) {
      set({ error: error.message || 'ثبت مرسوله ناموفق بود.' })
      throw error
    } finally {
      set({ saving: false })
    }
  },
  cancelShipment: async (trackingCode, reason) => {
    set({ error: '' })
    try {
      await cancelShipment(trackingCode, reason)
      set({
        shipments: get().shipments.map((shipment) =>
          shipment.trackingCode === trackingCode ? { ...shipment, status: 'cancelled' } : shipment,
        ),
      })
    } catch (error) {
      set({ error: error.message || 'لغو مرسوله ناموفق بود.' })
      throw error
    }
  },
  clearError: () => set({ error: '' }),
}))
