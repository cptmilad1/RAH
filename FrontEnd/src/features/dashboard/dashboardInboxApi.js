import request from '../store/hooks/api'

export async function getInboxMessages() {
  const response = await request('/parcels/conversations', { method: 'GET' })
  return response.data
}
