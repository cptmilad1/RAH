import { create } from 'zustand'
import { getDriverApplication, submitDriverApplication } from './driverApplicationApi'

export const useDriverApplicationStore = create((set) => ({
  application: null,
  loading: false,
  saving: false,
  error: '',
  notice: '',
  fetchApplication: async () => {
    set({ loading: true, error: '' })
    try {
      const application = await getDriverApplication()
      set({ application })
      return application
    } catch (error) {
      set({ error: error.message || 'دریافت وضعیت درخواست رانندگی ناموفق بود.' })
      return null
    } finally {
      set({ loading: false })
    }
  },
  submitApplication: async (payload) => {
    set({ saving: true, error: '', notice: '' })
    try {
      const result = await submitDriverApplication(payload)
      set({ application: result.data, notice: result.message })
      return true
    } catch (error) {
      set({ error: error.message || 'ثبت درخواست رانندگی ناموفق بود.' })
      return false
    } finally {
      set({ saving: false })
    }
  },
}))
