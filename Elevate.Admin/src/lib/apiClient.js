import { getApiAccessToken } from './authToken.js'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
export const isApiConfigured = Boolean(API_BASE_URL)

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response) {
  try {
    const errorBody = await response.json()
    return errorBody?.message || errorBody?.code || ''
  } catch {
    try {
      return await response.text()
    } catch {
      return ''
    }
  }
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL_NOT_CONFIGURED')
  }

  const { skipAuth = false, msalInstance, ...fetchOptions } = options
  const token = skipAuth ? '' : await getApiAccessToken(msalInstance)

  if (!skipAuth && !token) {
    throw new AuthError('AUTH_REDIRECT_REQUIRED')
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers,
      ...fetchOptions,
    })
  } catch (error) {
    throw new NetworkError(error?.message || 'NETWORK_ERROR')
  }

  if (!response.ok) {
    const message = await readErrorMessage(response)

    if (response.status === 401 && !skipAuth) {
      if (msalInstance) {
        await getApiAccessToken(msalInstance, { forceRefresh: true })
      }

      throw new AuthError(message || 'UNAUTHORIZED', 401)
    }

    throw new ApiError(message || `API_ERROR_${response.status}`, response.status)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
