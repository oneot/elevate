// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useAuth } from '../src/hooks/useAuth.js'
import { isSignedOut } from '../src/lib/signOutFlag.js'

const { instance } = vi.hoisted(() => ({
  instance: {
    getActiveAccount: () => ({ username: 'admin@microsoft-elevate.com' }),
    setActiveAccount: () => {},
    logoutRedirect: null,
  },
}))
vi.mock('@azure/msal-react', () => ({ useMsal: () => ({ accounts: [], inProgress: 'none', instance }) }))

let root
let host
let auth

function Probe() {
  const value = useAuth()
  useLayoutEffect(() => { auth = value })
  return null
}

beforeEach(async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  sessionStorage.clear()
  instance.logoutRedirect = vi.fn(() => Promise.resolve())
  host = document.createElement('div')
  root = createRoot(host)
  await act(() => root.render(<Probe />))
})

afterEach(async () => {
  await act(() => root.unmount())
  vi.unstubAllGlobals()
})

it('remembers the logout for this tab before redirecting to Microsoft sign-out', async () => {
  expect(isSignedOut()).toBe(false)
  await act(() => auth.logout())
  expect(isSignedOut()).toBe(true)
  expect(instance.logoutRedirect).toHaveBeenCalledWith({ account: { username: 'admin@microsoft-elevate.com' } })
})
