import request from '../store/hooks/api'

export async function getDirectConversations() {
  const response = await request('/direct-messages', { method: 'GET' })
  return response.data
}

export async function getUnreadDirectMessageCount() {
  const response = await request('/direct-messages/unread-count', { method: 'GET' })
  return response.data.count
}

export async function getDirectConversation(userId) {
  const response = await request(`/direct-messages/${encodeURIComponent(userId)}`, { method: 'GET' })
  return response.data
}

export async function sendDirectMessage(userId, message) {
  const response = await request(`/direct-messages/${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: { message },
  })
  return response.data
}
