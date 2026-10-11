async function request(path, options = {}) {
  const response = await fetch(`/api${path.startsWith('/') ? path : `/${path}`}`, {
    method: options.method || 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    const details = result.error?.map((issue) => issue.message).join(' ')
    throw new Error(details || result.message || 'Something went wrong. Please try again.')
  }

  return result
}

export function register(data) {
  return request('/auth/register', { method: 'POST', body: data })
}

export function login(data) {
  return request('/auth/login', { method: 'POST', body: data })
}

export function verifyEmail(token) {
  return request('/auth/verify-email', { method: 'POST', body: { token } })
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