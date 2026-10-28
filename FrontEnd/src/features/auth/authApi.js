import request from "../store/hooks/api"

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

export function logout() {
  return request('/logout', { method: 'POST' })
}
export function getProfile(id){
  return request(`/profile/${id}`, {method: "GET"})
}

export function updateProfile(id, data) {
  return request(`/profile/${id}`, { method: 'PATCH', body: data })
}