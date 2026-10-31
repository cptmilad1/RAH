import request from '../store/hooks/api'

export async function getUserBlockStatus(userId) {
  const response = await request(`/users/${encodeURIComponent(userId)}/block`, { method: 'GET' })
  return response.data
}

export async function blockUser(userId) {
  const response = await request(`/users/${encodeURIComponent(userId)}/block`, { method: 'PUT' })
  return response.data
}

export async function unblockUser(userId) {
  const response = await request(`/users/${encodeURIComponent(userId)}/block`, { method: 'DELETE' })
  return response.data
}
