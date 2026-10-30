import request from '../store/hooks/api'

export async function getAdminUsers() {
  const result = await request('/admin/users', { method: 'GET' })
  return result.data
}

export function updateUserRole(userId, role) {
  return request(`/users/${userId}/role`, { method: 'POST', body: { role } })
}

export function approveDriver(userId) {
  return request(`/admin/driver-applications/${userId}/approve`, { method: 'PATCH' })
}

export function rejectDriver(userId) {
  return request(`/admin/driver-applications/${userId}/reject`, { method: 'PATCH' })
}

export function updateAccountStatus(userId, isActive) {
  return request(`/admin/users/${userId}/status`, { method: 'PATCH', body: { isActive } })
}
