// @vitest-environment jsdom
import { act, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import PageBoundary from '../src/components/layout/PageBoundary.jsx'

let root
let host

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host, { onCaughtError() {} })
})

afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

it('surfaces a lazy chunk failure and recovers when navigating to another page', async () => {
  const Broken = lazy(() => Promise.reject(new Error('Chunk unavailable')))
  await act(() => root.render(
    <PageBoundary key="/broken"><Suspense fallback="Loading"><Broken /></Suspense></PageBoundary>,
  ))
  expect(host.querySelector('[role="alert"]').textContent).toContain('페이지를 표시하지 못했습니다')
  expect(host.querySelector('button').textContent).toBe('새로고침')
  expect(console.error).toHaveBeenCalled()
  await act(() => root.render(<PageBoundary key="/working"><p>Working page</p></PageBoundary>))
  expect(host.querySelector('[role="alert"]')).toBeNull()
  expect(host.textContent).toBe('Working page')
})
