import { getApiAccessToken } from './authToken.js'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
/** API 서버 URL이 환경 변수에 설정되어 있는지 여부. UI에서 API 호출 가능 여부를 판단할 때 사용한다. */
export const isApiConfigured = Boolean(API_BASE_URL)

/** 401 Unauthorized 응답 또는 인증 세션 만료 시 발생하는 에러. */
export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

/** fetch 자체가 실패(네트워크 단절, CORS, DNS 오류 등)했을 때 발생하는 에러. */
export class NetworkError extends Error {
  constructor(message) {
    super(message)
    this.name = 'NetworkError'
  }
}

/** HTTP 응답은 수신했으나 2xx가 아닌 상태 코드일 때 발생하는 에러. status 프로퍼티에 HTTP 코드가 담긴다. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * 응답 본문에서 에러 메시지를 추출한다.
 * JSON 파싱을 먼저 시도하고 실패하면 plain text로 폴백한다.
 * 두 경우 모두 실패하면 빈 문자열을 반환한다.
 * @param {Response} response
 * @returns {Promise<string>}
 */
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

/**
 * 인증이 포함된 API 요청을 수행하는 기본 fetch 래퍼.
 *
 * 인증 흐름:
 * 1. skipAuth가 false이면 MSAL을 통해 Bearer 토큰을 획득한다.
 * 2. 토큰 획득에 실패하면(redirect 중) AuthError('AUTH_REDIRECT_REQUIRED')를 던진다.
 * 3. 401 응답 시 토큰을 강제 갱신(forceRefresh)하고 AuthError를 던진다 — 호출자가 재시도 여부를 결정한다.
 * 4. 204 No Content 응답은 null 을 반환한다.
 *
 * @param {string} path - API 경로 (예: '/api/posts')
 * @param {object} options - fetch 옵션 + { skipAuth, msalInstance }
 * @returns {Promise<any>} 응답 JSON 또는 null(204)
 * @throws {AuthError} 인증 실패 또는 401 응답
 * @throws {NetworkError} 네트워크 오류
 * @throws {ApiError} 4xx/5xx 응답
 */
export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL_NOT_CONFIGURED')
  }

  const { skipAuth = false, msalInstance, ...fetchOptions } = options
  const token = skipAuth ? '' : await getApiAccessToken(msalInstance)

  if (!skipAuth && !token) {
    // 토큰이 없으면 MSAL이 이미 redirect를 시작한 상태이므로 더 이상 진행하지 않는다.
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
      // 401 수신 시 캐시된 토큰이 만료되었을 수 있으므로 강제 갱신을 시도한다.
      // 갱신 성공 여부와 무관하게 AuthError를 던져 호출자가 재시도를 결정하게 한다.
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
