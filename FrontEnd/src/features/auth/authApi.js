import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

async function request(path, options = {}) {
  const normalizedPath = path.replace(/^\/+/, '')

  const response = await api.request({
    url: normalizedPath,
    method: options.method || 'POST',
    data: options.body,
    headers: options.headers,
    params: options.params,
  })

  return response.data
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data || {}
    const details = payload.error?.map((issue) => issue.message).join(' ')
    const message = details || payload.message || 'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export function register(data) {
  return request('/auth/register', { method: 'POST', body: data })
}

export function login(data) {
  return request('/auth/login', { method: 'POST', body: data })
}

export function verifyEmail(code) {
  return request('/auth/verify-email', { method: 'POST', body: { code } })
}

export function forgotPassword(email) {
  return request('/forgot-password', { method: 'POST', body: { email } })
}

export function resetPassword(token, newPassword) {
  return request('/auth/reset-password', { method: 'POST', body: { token, newPassword } })
}

export function getProfile(userId) {
  return request(`/profile/${userId}`, { method: 'GET' })
}

export function logout() {
  return request('/logout', { method: 'POST' })
}