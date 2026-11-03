import request from '../store/hooks/api'

export function getUserSettings() {
  return request('/settings/me', { method: 'GET' })
}

export function updateUserSetting(setting) {
  return request('/settings/me', { method: 'PATCH', body: setting })
}
