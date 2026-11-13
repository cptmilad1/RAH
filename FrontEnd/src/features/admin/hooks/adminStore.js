import { create } from 'zustand'
import { approveDriver, getAdminUsers, rejectDriver, updateAccountStatus, updateUserRole } from '../api/adminApi'
import { toast } from '../../../global/toast/toastStore'

export const useAdminStore = create((set, get) => ({
  users: [],
  loading: false,
  updatingId: null,
  error: '',
  fetchUsers: async () => {
    set({ loading: true, error: '' })
    try {
      const users = await getAdminUsers()
      set({ users })
    } catch (error) {
      set({ error: error.message || 'دریافت فهرست کاربران ناموفق بود.' })
    } finally {
      set({ loading: false })
    }
  },
  setUserRole: async (userId, role) => {
    set({ updatingId: userId, error: '' })
    try {
      await updateUserRole(userId, role)
      set({ users: get().users.map((user) => user.id === userId ? { ...user, role } : user) })
      toast.success(role === 'admin' ? 'toast.driverRoleGranted' : 'toast.driverRoleRemoved')
      return true
    } catch (error) {
      set({ error: error.message || 'تغییر نقش کاربر ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  approveDriver: async (userId) => {
    set({ updatingId: userId, error: '' })
    try {
      await approveDriver(userId)
      set({
        users: get().users.map((user) => user.id === userId
          ? { ...user, role: 'driver', driverStatus: 'approved' }
          : user),
      })
      toast.success('toast.driverApproved')
      return true
    } catch (error) {
      set({ error: error.message || 'تأیید درخواست رانندگی ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  rejectDriver: async (userId) => {
    set({ updatingId: userId, error: '' })
    try {
      await rejectDriver(userId)
      set({ users: get().users.map((user) => user.id === userId ? { ...user, driverStatus: 'rejected' } : user) })
      toast.info('toast.driverRejected')
      return true
    } catch (error) {
      set({ error: error.message || 'رد درخواست رانندگی ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  setAccountActive: async (userId, isActive) => {
    set({ updatingId: userId, error: '' })
    try {
      await updateAccountStatus(userId, isActive)
      set({ users: get().users.map((user) => user.id === userId ? { ...user, isActive } : user) })
      toast.success(isActive ? 'toast.accountActivated' : 'toast.accountDeactivated')
      return true
    } catch (error) {
      set({ error: error.message || 'تغییر وضعیت حساب ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
}))
