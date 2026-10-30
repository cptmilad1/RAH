import request from '../store/hooks/api'

export async function getAvailableDriverParcels() {
  const response = await request('/parcels/driver/available', { method: 'GET' })
  return response.data
}

export async function acceptDriverParcel(trackingCode) {
  const response = await request(`/parcels/driver/available/${encodeURIComponent(trackingCode)}/accept`, {
    method: 'POST',
  })
  return response.data
}