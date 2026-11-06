import request from '../../store/hooks/api'

export function changePassword(payload) {
  return request('/change-password', { method: 'POST', body: payload })
}

export function getSessions() {
  return request('/sessions', { method: 'GET' })
}

export function logoutAllSessions() {
  return request('/logout-all', { method: 'POST' })
}

export function logoutSession(sessionId) {
  return request(`/sessions/${sessionId}`, { method: 'DELETE' })
}
