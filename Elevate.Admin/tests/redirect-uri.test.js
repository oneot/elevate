import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveRedirectUri } from '../src/lib/redirectUri.js'

const WHITE_SEA = 'https://white-sea-0567ed600.4.azurestaticapps.net'
const ADMIN = 'https://admin.microsoft-elevate.com'

describe('resolveRedirectUri', () => {
  it.each([
    ['uses the current origin when nothing is configured', undefined, WHITE_SEA, WHITE_SEA],
    ['ignores a blank override', '   ', ADMIN, ADMIN],
    ['keeps a same-origin override exactly as configured', ADMIN, ADMIN, ADMIN],
    ['keeps a trailing slash of a same-origin override', `${ADMIN}/`, ADMIN, `${ADMIN}/`],
    ['ignores the custom-domain override on the default host', ADMIN, WHITE_SEA, WHITE_SEA],
    ['ignores the default-host override on the custom domain', `${WHITE_SEA}/`, ADMIN, ADMIN],
    ['resolves a path override against the current origin', '/auth/callback', WHITE_SEA, `${WHITE_SEA}/auth/callback`],
    ['does not treat a protocol-relative URL as a path', '//evil.example.com/callback', ADMIN, ADMIN],
    ['ignores an override for another scheme of the same host', 'http://admin.microsoft-elevate.com', ADMIN, ADMIN],
    ['ignores an unparsable override', 'not a url', ADMIN, ADMIN],
    ['trims surrounding whitespace', ` ${ADMIN} `, ADMIN, ADMIN],
  ])('%s', (_name, configured, origin, expected) => {
    expect(resolveRedirectUri(configured, origin)).toBe(expected)
  })
})

describe('msalConfig redirect URIs', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function loadConfig(origin, configured) {
    vi.resetModules()
    vi.stubGlobal('window', { location: { origin } })
    vi.stubEnv('VITE_AZURE_AD_REDIRECT_URI', configured)
    return (await import('../src/lib/msalConfig.js')).msalConfig
  }

  it.each([
    [WHITE_SEA, ADMIN, WHITE_SEA],
    [ADMIN, ADMIN, ADMIN],
    [ADMIN, `${ADMIN}/`, `${ADMIN}/`],
    [ADMIN, '', ADMIN],
    ['http://localhost:5173', ADMIN, 'http://localhost:5173'],
  ])('on %s with override %j sends %s for login and logout', async (origin, configured, expected) => {
    const config = await loadConfig(origin, configured)
    expect(config.auth.redirectUri).toBe(expected)
    expect(config.auth.postLogoutRedirectUri).toBe(expected)
  })
})
