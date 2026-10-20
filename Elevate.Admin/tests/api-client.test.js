import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { apiFetch, ApiError, AuthError, NetworkError } from '../src/lib/apiClient.js'
import { getApiAccessToken } from '../src/lib/authToken.js'

vi.mock('../src/lib/authToken.js', () => ({ getApiAccessToken: vi.fn() }))

const msalInstance = {}

beforeEach(() => {
  getApiAccessToken.mockResolvedValue('test-access-token')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ id: 'post-1' })))
})

afterEach(() => vi.unstubAllGlobals())

it.each([
  { 'X-Correlation-Id': 'request-1' },
  new Headers({ 'X-Correlation-Id': 'request-1' }),
  [['X-Correlation-Id', 'request-1']],
])('preserves custom headers without dropping authentication: %s', async (headers) => {
  await apiFetch('/posts', { msalInstance, headers })
  const sent = new Headers(fetch.mock.calls[0][1].headers)
  expect(sent.get('authorization')).toBe('Bearer test-access-token')
  expect(sent.get('content-type')).toBe('application/json')
  expect(sent.get('x-correlation-id')).toBe('request-1')
})

it('uses the current MSAL token rather than a caller-supplied authorization header', async () => {
  await apiFetch('/posts', { msalInstance, headers: { authorization: 'Bearer stale' } })
  expect(new Headers(fetch.mock.calls[0][1].headers).get('authorization')).toBe('Bearer test-access-token')
})

it('respects an explicitly supplied content type', async () => {
  await apiFetch('/posts', { msalInstance, headers: { 'Content-Type': 'application/problem+json' } })
  expect(new Headers(fetch.mock.calls[0][1].headers).get('content-type')).toBe('application/problem+json')
})

it('reads a plain-text error body once instead of losing its message after JSON parsing', async () => {
  fetch.mockResolvedValue(new Response('Upstream unavailable', { status: 503 }))
  await expect(apiFetch('/posts', { msalInstance })).rejects.toMatchObject({
    name: 'ApiError', status: 503, message: 'Upstream unavailable',
  })
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('preserves the existing JSON error contract', async () => {
  fetch.mockResolvedValue(Response.json({ code: 'Conflict', message: 'Duplicate slug' }, { status: 409 }))
  await expect(apiFetch('/posts', { msalInstance })).rejects.toMatchObject({
    name: 'ApiError', status: 409, message: 'Duplicate slug',
  })
})

it('refreshes a 401 token without automatically replaying a write', async () => {
  fetch.mockResolvedValue(Response.json({ message: 'Expired' }, { status: 401 }))
  await expect(apiFetch('/posts', { msalInstance, method: 'POST', body: '{}' })).rejects.toBeInstanceOf(AuthError)
  expect(getApiAccessToken).toHaveBeenLastCalledWith(msalInstance, { forceRefresh: true })
  expect(fetch).toHaveBeenCalledTimes(1)
})

it('does not send a request while authentication redirects', async () => {
  getApiAccessToken.mockResolvedValue('')
  await expect(apiFetch('/posts', { msalInstance })).rejects.toMatchObject({ message: 'AUTH_REDIRECT_REQUIRED' })
  expect(fetch).not.toHaveBeenCalled()
})

it('preserves caller cancellation instead of reporting a network failure', async () => {
  const controller = new AbortController()
  const reason = new DOMException('Cancelled by caller', 'AbortError')
  fetch.mockImplementation(async () => { controller.abort(reason); throw reason })
  await expect(apiFetch('/posts', { msalInstance, signal: controller.signal })).rejects.toBe(reason)
})

it('does not acquire a token or send a request for an already aborted caller', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(apiFetch('/posts', { msalInstance, signal: controller.signal })).rejects.toBe(controller.signal.reason)
  expect(fetch).not.toHaveBeenCalled()
  expect(getApiAccessToken).not.toHaveBeenCalled()
})

it('does not send a request cancelled during token acquisition', async () => {
  const controller = new AbortController()
  getApiAccessToken.mockImplementation(async () => { controller.abort(); return 'test-access-token' })
  await expect(apiFetch('/posts', { msalInstance, signal: controller.signal })).rejects.toBe(controller.signal.reason)
  expect(fetch).not.toHaveBeenCalled()
})

it('reports a broken successful response as an API error', async () => {
  fetch.mockResolvedValue(new Response('<html>not JSON</html>'))
  await expect(apiFetch('/posts', { msalInstance })).rejects.toBeInstanceOf(ApiError)
})

it('distinguishes a response stream failure from malformed JSON', async () => {
  fetch.mockResolvedValue(new Response(new ReadableStream({
    start(controller) { controller.error(new TypeError('connection lost')) },
  })))
  await expect(apiFetch('/posts', { msalInstance })).rejects.toBeInstanceOf(NetworkError)
})

it('does not parse a successful empty DELETE response', async () => {
  fetch.mockResolvedValue(new Response(null, { status: 204 }))
  await expect(apiFetch('/posts/post-1', { msalInstance, method: 'DELETE' })).resolves.toBeNull()
})

it('does not acquire or refresh a token for skipAuth requests', async () => {
  fetch.mockResolvedValue(Response.json({ message: 'Unauthorized' }, { status: 401 }))
  await expect(apiFetch('/health', { skipAuth: true })).rejects.toBeInstanceOf(ApiError)
  expect(getApiAccessToken).not.toHaveBeenCalled()
})
