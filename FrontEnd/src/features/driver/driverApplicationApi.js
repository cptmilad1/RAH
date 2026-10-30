import request from '../store/hooks/api'

export async function getDriverApplication() {
  const result = await request('/driver-applications/me', { method: 'GET' })
  return result.data
}

export function submitDriverApplication(application) {
  return request('/driver-applications', { method: 'POST', body: application })
}
