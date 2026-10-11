async function request(path, body) {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = result.error?.map((issue) => issue.message).join(' ')
    throw new Error(details || result.message || 'Something went wrong. Please try again.')
  }
  return result
}

export function register(data) {
  return request('register', data)
}

export function login(data) {
  return request('login', data)
}

export function verifyEmail(token) {
  return request('verify-email', { token })
}

export function forgotPassword(email) {
  return request('forgot-password', { email })
}

export function resetPassword(token, newPassword) {
  return request('reset-password', { token, newPassword })
}