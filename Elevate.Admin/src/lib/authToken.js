const DEV_BEARER_TOKEN = import.meta.env.VITE_DEV_BEARER_TOKEN || ''
const API_AUDIENCE = import.meta.env.AUTH_API_AUDIENCE || import.meta.env.VITE_AUTH_API_AUDIENCE || ''

let cachedToken = ''
let cachedTokenExp = 0

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.')
    if (parts.length < 2) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const decoded = atob(padded)

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function getTokenExpEpochSeconds(token) {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    return 0
  }

  return payload.exp
}

function isExpired(expEpochSeconds) {
  if (!expEpochSeconds) return true
  const now = Math.floor(Date.now() / 1000)
  return expEpochSeconds <= now + 60
}

function tokenMatchesAudience(token, audience) {
  if (!audience) return true

  const payload = decodeJwtPayload(token)
  if (!payload || !payload.aud) return false

  if (Array.isArray(payload.aud)) {
    return payload.aud.includes(audience)
  }

  return payload.aud === audience
}

function findAudienceToken(entries) {
  const tokens = entries
    .map((item) => item?.access_token)
    .filter((token) => typeof token === 'string' && token.length > 0)

  if (tokens.length === 0) {
    return ''
  }

  if (!API_AUDIENCE) {
    return tokens[0]
  }

  const matched = tokens.find((token) => tokenMatchesAudience(token, API_AUDIENCE))
  return matched || ''
}

async function readTokenFromSwaAuth() {
  const response = await fetch('/.auth/me', {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('AUTH_TOKEN_FETCH_FAILED')
  }

  const body = await response.json()
  const entries = Array.isArray(body) ? body : []
  const token = findAudienceToken(entries)

  if (!token) {
    throw new Error('AUTH_TOKEN_NOT_FOUND_FOR_AUDIENCE')
  }

  return token
}

export async function getApiAccessToken() {
  if (DEV_BEARER_TOKEN) {
    return DEV_BEARER_TOKEN
  }

  if (cachedToken && !isExpired(cachedTokenExp)) {
    return cachedToken
  }

  const token = await readTokenFromSwaAuth()
  const exp = getTokenExpEpochSeconds(token)

  cachedToken = token
  cachedTokenExp = exp

  return token
}
