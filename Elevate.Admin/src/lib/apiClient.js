import { getApiAccessToken } from './authToken.js'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const isApiConfigured = Boolean(API_BASE_URL)

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL_NOT_CONFIGURED')
  }

  const token = options.skipAuth ? '' : await getApiAccessToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  })

  if (!response.ok) {
    let message = ''

    try {
      const errorBody = await response.json()
      message = errorBody?.message || errorBody?.code || ''
    } catch {
      message = await response.text()
    }

    throw new Error(message || `API_ERROR_${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
