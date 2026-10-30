import { create } from 'zustand'
import { approveDriver, getAdminUsers, rejectDriver, updateAccountStatus, updateUserRole } from './adminApi'

export const useAdminStore = create((set, get) => ({
  users: [],
  loading: false,
  updatingId: null,
  error: '',
  notice: '',
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
    set({ updatingId: userId, error: '', notice: '' })
    try {
      await updateUserRole(userId, role)
      set({
        users: get().users.map((user) => user.id === userId ? { ...user, role } : user),
        notice: role === 'admin' ? 'دسترسی مدیر برای کاربر فعال شد.' : 'دسترسی مدیر از کاربر گرفته شد.',
      })
      return true
    } catch (error) {
      set({ error: error.message || 'تغییر نقش کاربر ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  approveDriver: async (userId) => {
    set({ updatingId: userId, error: '', notice: '' })
    try {
      await approveDriver(userId)
      set({
        users: get().users.map((user) => user.id === userId
          ? { ...user, role: 'driver', driverStatus: 'approved' }
          : user),
        notice: 'درخواست رانندگی تأیید شد.',
      })
      return true
    } catch (error) {
      set({ error: error.message || 'تأیید درخواست رانندگی ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  rejectDriver: async (userId) => {
    set({ updatingId: userId, error: '', notice: '' })
    try {
      await rejectDriver(userId)
      set({
        users: get().users.map((user) => user.id === userId ? { ...user, driverStatus: 'rejected' } : user),
        notice: 'درخواست رانندگی رد شد و به کاربر اطلاع داده شد.',
      })
      return true
    } catch (error) {
      set({ error: error.message || 'رد درخواست رانندگی ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
  setAccountActive: async (userId, isActive) => {
    set({ updatingId: userId, error: '', notice: '' })
    try {
      await updateAccountStatus(userId, isActive)
      set({
        users: get().users.map((user) => user.id === userId ? { ...user, isActive } : user),
        notice: isActive ? 'حساب کاربر فعال شد.' : 'حساب غیرفعال شد و نشست‌های فعال آن بسته شدند.',
      })
      return true
    } catch (error) {
      set({ error: error.message || 'تغییر وضعیت حساب ناموفق بود.' })
      return false
    } finally {
      set({ updatingId: null })
    }
  },
}))
