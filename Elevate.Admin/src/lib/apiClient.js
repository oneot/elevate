export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const isApiConfigured = Boolean(API_BASE_URL)

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL_NOT_CONFIGURED')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API_ERROR_${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
