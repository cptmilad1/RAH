import request from '../store/hooks/api'

export async function getShipments() {
  const response = await request('/parcels', { method: 'GET' })
  return response.data
}

export async function createShipment(payload) {
  const response = await request('/parcels', { method: 'POST', body: payload })
  return response.data
}

export async function getShipment(trackingCode) {
  const response = await request(`/parcels/${encodeURIComponent(trackingCode)}`, { method: 'GET' })
  return response.data
}

export function cancelShipment(trackingCode, reason) {
  return request(`/parcels/${encodeURIComponent(trackingCode)}/cancel`, {
    method: 'PATCH',
    body: { reason },
  })
}
