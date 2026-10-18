// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import { createPost, getPost, listPosts, listSeriesByCategory } from '../src/services/postsApi.js'
import { getCalendarEvent, listCalendarEvents } from '../src/services/calendarEventsApi.js'
import { getActivityVideo } from '../src/services/activityVideosApi.js'

const { msalInstance, uploadState } = vi.hoisted(() => ({
  msalInstance: {}, uploadState: { uploading: false },
}))
vi.mock('../src/hooks/useAuth.js', () => ({ useAuth: () => ({ msalInstance }) }))
vi.mock('../src/hooks/usePostUpload.js', () => ({
  usePostUpload: () => ({ ...uploadState, uploadThumbnail: vi.fn(), uploadHtmlImage: vi.fn() }),
}))
vi.mock('../src/components/layout/Sidebar.jsx', () => ({ default: () => <aside>Sidebar</aside> }))
vi.mock('../src/components/layout/TopBar.jsx', () => ({ default: () => <header>TopBar</header> }))
vi.mock('../src/components/editor/index.js', async () => ({
  HtmlEditor: ({ value, onChange }) => (
    <textarea aria-label="HTML body" value={value} onChange={(event) => onChange(event.target.value)} />
  ),
  PostMetaSidebar: (await import('../src/components/editor/PostMetaSidebar.jsx')).default,
}))
vi.mock('../src/components/editor/AttachUploader.jsx', () => ({
  default: ({ postId, draftSessionId }) => <output data-attachment-owner>{postId || draftSessionId}</output>,
}))
vi.mock('../src/services/postsApi.js', () => ({
  createPost: vi.fn(), deletePost: vi.fn(), getPost: vi.fn(),
  listPosts: vi.fn(), listSeriesByCategory: vi.fn(), updatePost: vi.fn(),
}))
vi.mock('../src/services/calendarEventsApi.js', () => ({
  createCalendarEvent: vi.fn(), deleteCalendarEvent: vi.fn(), getCalendarEvent: vi.fn(),
  listCalendarEvents: vi.fn(), updateCalendarEvent: vi.fn(),
}))
vi.mock('../src/services/activityVideosApi.js', () => ({
  createActivityVideo: vi.fn(), deleteActivityVideo: vi.fn(), getActivityVideo: vi.fn(),
  listActivityVideos: vi.fn(), updateActivityVideo: vi.fn(),
}))

let root
let host
let navigate

function NavigationProbe() {
  const go = useNavigate()
  useLayoutEffect(() => { navigate = go }, [go])
  return null
}

async function renderRoute(path) {
  await act(() => root.render(<MemoryRouter initialEntries={[path]}><NavigationProbe /><App /></MemoryRouter>))
  await act(() => vi.dynamicImportSettled())
}

async function goTo(path) {
  await act(() => navigate(path))
  await act(() => vi.dynamicImportSettled())
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected external request') }))
  localStorage.clear()
  sessionStorage.clear()
  uploadState.uploading = false
  getPost.mockResolvedValue({
    id: 'post-1', title: 'Existing post', category: 'm365', htmlBody: '<p>Existing content</p>',
    tags: ['old'], status: 'published', series: '',
  })
  listPosts.mockResolvedValue({ items: [], totalCount: 0, totalPages: 0 })
  listSeriesByCategory.mockResolvedValue({ items: [] })
  listCalendarEvents.mockResolvedValue({ items: [] })
  getCalendarEvent.mockResolvedValue({ title: 'Existing event', eventDates: [{ start: '2026-10-18' }] })
  getActivityVideo.mockResolvedValue({ title: 'Existing video', videoId: 'QU0o1hRJP68', category: '행사', year: '2026' })
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

it('starts a clean post draft after leaving an existing editor while keeping the layout mounted', async () => {
  await renderRoute('/posts/post-1')
  expect(host.querySelector('input[placeholder="포스트 제목"]').value).toBe('Existing post')
  const header = host.querySelector('header')
  await goTo('/posts/new?category=teams')
  expect(host.querySelector('header')).toBe(header)
  expect(host.querySelector('input[placeholder="포스트 제목"]').value).toBe('')
  expect(host.querySelector('textarea[aria-label="HTML body"]').value).toBe('')
  expect(host.querySelector('[data-attachment-owner]').textContent).toMatch(/^draft-/)
  const selects = [...host.querySelectorAll('select')]
  expect(selects.find((select) => [...select.options].some((option) => option.value === 'published')).value).toBe('draft')
  expect(selects.find((select) => [...select.options].some((option) => option.value === 'teams')).value).toBe('teams')
  expect(createPost).not.toHaveBeenCalled()
})

it.each([
  ['/calendar-events/event-1', '/calendar-events/new', '이벤트 제목', 'Existing event'],
  ['/activity-videos/video-1', '/activity-videos/new', '활동 영상 제목', 'Existing video'],
])('clears record-specific state when navigating from %s to a new editor', async (existing, next, placeholder, title) => {
  await renderRoute(existing)
  expect(host.querySelector(`input[placeholder="${placeholder}"]`).value).toBe(title)
  await goTo(next)
  expect(host.querySelector(`input[placeholder="${placeholder}"]`).value).toBe('')
})

it('does not let a late existing-post response populate the new draft', async () => {
  let resolveOld
  getPost.mockImplementation(() => new Promise((resolve) => { resolveOld = resolve }))
  await renderRoute('/posts/slow')
  await goTo('/posts/new?category=m365')
  await act(() => resolveOld({ id: 'slow', title: 'Late old title', htmlBody: '<p>Late body</p>' }))
  expect(host.querySelector('input[placeholder="포스트 제목"]').value).toBe('')
})

it('disables saving while image uploads are still in flight', async () => {
  uploadState.uploading = true
  await renderRoute('/posts/new?category=m365')
  const save = [...host.querySelectorAll('button')].find((button) => /저장|이미지 업로드 중/.test(button.textContent))
  expect(save.disabled).toBe(true)
  await act(() => save.click())
  expect(createPost).not.toHaveBeenCalled()
})
