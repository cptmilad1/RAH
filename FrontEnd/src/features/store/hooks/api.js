import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

function notifySessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:session-expired'))
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error.response?.status === 401
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')

    if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true

      try {
        await refreshAccessToken()
        return api(originalRequest)
      } catch (refreshError) {
        notifySessionExpired()
        error = refreshError
      }
    }

    const payload = error.response?.data || {}
    const details = payload.error?.map((issue) => issue.message).join(' ')
    const message = details || payload.message || 'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

async function request(path, options = {}) {
  const normalizedPath = path.replace(/^\/+/, '')

  const response = await api.request({
    url: normalizedPath,
    method: options?.method || 'POST',
    data: options?.body,
    headers: options?.headers,
    params: options?.params,
  })

  return response.data
}
export default request