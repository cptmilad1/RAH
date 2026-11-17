import request from '../../store/hooks/api'

export async function getMyTaxiRides() {
  const response = await request('/taxi/requests/mine', { method: 'GET' })
  return response.data
}

export async function getAvailableTaxiRides() {
  const response = await request('/taxi/requests/available', { method: 'GET' })
  return response.data
}

export async function createTaxiRide(payload) {
  const response = await request('/taxi/requests', { method: 'POST', body: payload })
  return response.data
}

export async function acceptTaxiRide(rideId) {
  return request(`/taxi/requests/${rideId}/accept`, { method: 'POST' })
}

export async function rejectTaxiRide(rideId) {
  return request(`/taxi/requests/${rideId}/reject`, { method: 'POST' })
}

export async function updateTaxiRideStatus(rideId, status) {
  return request(`/taxi/requests/${rideId}/status`, { method: 'PATCH', body: { status } })
}

export async function cancelTaxiRide(rideId, reason = '') {
  return request(`/taxi/requests/${rideId}/cancel`, { method: 'POST', body: { reason } })
}

export async function rateTaxiRide(rideId, payload) {
  return request(`/taxi/requests/${rideId}/rating`, { method: 'POST', body: payload })
}

export async function getTaxiVipFare() {
  const response = await request('/taxi/vip-fare', { method: 'GET' })
  return response.data
}

export async function updateTaxiVipFare(fare) {
  const response = await request('/taxi/admin/vip-fare', { method: 'PUT', body: { fare } })
  return response.data
}

export async function getTaxiAdminRides() {
  const response = await request('/taxi/admin/requests', { method: 'GET' })
  return response.data
}

export async function getTaxiAdminDrivers() {
  const response = await request('/taxi/admin/drivers', { method: 'GET' })
  return response.data
}

export async function getTaxiAvailability() {
  const response = await request('/taxi/availability', { method: 'GET' })
  return response.data
}

export async function updateTaxiAvailability(payload) {
  const response = await request('/taxi/availability', { method: 'PUT', body: payload })
  return response.data
}