// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import { createPost, getPost, listAllPosts, listSeriesByCategory, updatePost } from '../src/services/postsApi.js'

const { msalInstance, uploadState } = vi.hoisted(() => ({
  msalInstance: {}, uploadState: { uploading: false },
}))
vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: () => ({
    msalInstance,
    account: { name: '관리자', username: 'admin@microsoft-elevate.com' },
    inProgress: 'none',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))
vi.mock('../src/hooks/usePostUpload.js', () => ({
  usePostUpload: () => ({ ...uploadState, uploadThumbnail: vi.fn(), uploadHtmlImage: vi.fn() }),
}))
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
  createPost: vi.fn(), deletePost: vi.fn(), getPost: vi.fn(), listAllPosts: vi.fn(),
  listPosts: vi.fn(), listSeriesByCategory: vi.fn(), updatePost: vi.fn(),
}))

let root
let host
let navigate
let currentPath

function NavigationProbe() {
  const go = useNavigate()
  const location = useLocation()
  useLayoutEffect(() => {
    navigate = go
    currentPath = `${location.pathname}${location.search}`
  }, [go, location])
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

function setValue(element, value) {
  const { set } = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')
  set.call(element, value)
  element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
}

const titleInput = () => host.querySelector('input[placeholder="게시글 제목"]')
const tagsInput = () => host.querySelector('input[placeholder="Azure, CosmosDB"]')
const appSelect = () => [...host.querySelectorAll('select')]
  .find((select) => [...select.options].some((option) => option.value === 'github'))
const saveButton = () => [...host.querySelectorAll('button')]
  .find((button) => /^(저장|저장 중\.\.\.|이미지 업로드 중\.\.\.|첨부 업로드 중\.\.\.)$/.test(button.textContent.trim()))

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected external request') }))
  localStorage.clear()
  sessionStorage.clear()
  uploadState.uploading = false
  getPost.mockResolvedValue({
    id: 'post-1', title: 'Existing post', category: 'm365', slug: 'existing-post', htmlBody: '<p>Existing content</p>',
    tags: ['old'], status: 'published', series: '', updatedAt: '2026-10-18T01:00:00Z',
  })
  listAllPosts.mockResolvedValue([])
  listSeriesByCategory.mockResolvedValue({ items: [] })
  createPost.mockResolvedValue({ id: 'created-1' })
  updatePost.mockResolvedValue({ id: 'post-1', status: 'published', slug: 'existing-post', updatedAt: '2026-10-20T01:00:00Z' })
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
  expect(titleInput().value).toBe('Existing post')
  const header = host.querySelector('header')
  await goTo('/posts/new?category=teams')
  expect(host.querySelector('header')).toBe(header)
  expect(titleInput().value).toBe('')
  expect(host.querySelector('textarea[aria-label="HTML body"]').value).toBe('')
  expect(host.querySelector('[data-attachment-owner]').textContent).toMatch(/^draft-/)
  const selects = [...host.querySelectorAll('select')]
  expect(selects.find((select) => [...select.options].some((option) => option.value === 'published')).value).toBe('draft')
  expect(appSelect().value).toBe('teams')
  expect(createPost).not.toHaveBeenCalled()
})

it.each([
  '/calendar-events/new',
  '/calendar-events/event-1',
  '/activity-videos',
  '/activity-videos/new',
  '/activity-videos/video-1',
  '/apps/event',
  '/apps/program-news',
])('no longer offers the removed sub category or management screen %s', async (path) => {
  await renderRoute(path)
  expect(host.textContent).toContain('페이지를 찾을 수 없습니다')
  expect(titleInput()).toBeNull()
})

it('redirects the previous category address to the app list', async () => {
  await renderRoute('/category/m365')
  expect(currentPath).toBe('/apps/m365')
  expect(host.querySelector('h1').textContent).toBe('M365')
})

it('does not let a late existing-post response populate the new draft', async () => {
  let resolveOld
  getPost.mockImplementation(() => new Promise((resolve) => { resolveOld = resolve }))
  await renderRoute('/posts/slow')
  await goTo('/posts/new?app=m365')
  await act(() => resolveOld({ id: 'slow', title: 'Late old title', category: 'm365', htmlBody: '<p>Late body</p>' }))
  expect(titleInput().value).toBe('')
})

it('disables saving while image uploads are still in flight', async () => {
  uploadState.uploading = true
  await renderRoute('/posts/new?app=m365')
  const save = saveButton()
  expect(save.disabled).toBe(true)
  await act(() => save.click())
  expect(createPost).not.toHaveBeenCalled()
})

it.each([
  ['word', 'm365', ['word']],
  ['powerpoint', 'm365', ['powerpoint']],
  ['github', 'copilot-studio', ['github']],
  ['azure', 'copilot-studio', ['azure']],
  ['copilot', 'copilot', []],
])('creates a new %s post in the %s category with the app tags %j', async (app, category, tags) => {
  await renderRoute(`/posts/new?app=${app}`)
  expect(tagsInput().value).toBe(tags.join(', '))
  await act(() => setValue(titleInput(), 'New guide'))
  await act(() => saveButton().click())
  expect(createPost).toHaveBeenCalledTimes(1)
  expect(createPost.mock.calls[0][0]).toMatchObject({ category, tags, title: 'New guide', slug: 'new-guide', status: 'draft' })
  expect(currentPath).toBe('/posts/created-1')
})

it('swaps the app tag and server category when the app of a new post changes', async () => {
  await renderRoute('/posts/new?app=word')
  await act(() => setValue(tagsInput(), 'word, guide'))
  await act(() => setValue(appSelect(), 'powerpoint'))
  expect(tagsInput().value).toBe('powerpoint, guide')
  await act(() => setValue(appSelect(), 'teams'))
  expect(tagsInput().value).toBe('guide')
  await act(() => setValue(titleInput(), 'Teams guide'))
  await act(() => saveButton().click())
  expect(createPost.mock.calls[0][0]).toMatchObject({ category: 'teams', tags: ['guide'] })
})

it('requires an app before saving a post started from all posts', async () => {
  await renderRoute('/posts/new')
  expect(appSelect().value).toBe('')
  await act(() => setValue(titleInput(), 'No app yet'))
  await act(() => saveButton().click())
  expect(createPost).not.toHaveBeenCalled()
  expect(host.querySelector('[role="alert"]').textContent).toContain('앱을 선택해주세요.')
})

it('saves an existing post without changing its category and refreshes the shared list', async () => {
  await renderRoute('/posts/post-1')
  const loadsBeforeSave = listAllPosts.mock.calls.length
  await act(() => setValue(titleInput(), 'Edited title'))
  await act(() => saveButton().click())
  expect(updatePost).toHaveBeenCalledWith('post-1', expect.objectContaining({ category: 'm365', title: 'Edited title', tags: ['old'] }), { msalInstance })
  expect(host.textContent).toContain('업데이트되었습니다.')
  expect(listAllPosts.mock.calls.length).toBeGreaterThan(loadsBeforeSave)
})

it('does not open an editable form for posts outside the managed apps', async () => {
  getPost.mockResolvedValue({ id: 'event-1', title: 'Event post', category: 'event', slug: 'event-post', tags: [], status: 'published' })
  await renderRoute('/posts/event-1')
  expect(host.textContent).toContain('관리자에서 다루지 않는 게시글입니다.')
  expect(titleInput()).toBeNull()
  expect(saveButton()).toBeUndefined()
})

it('keeps the form closed when an existing post fails to load, then retries', async () => {
  getPost.mockRejectedValueOnce(new Error('Network down'))
  await renderRoute('/posts/post-1')
  expect(host.textContent).toContain('게시글을 불러오지 못했습니다.')
  expect(titleInput()).toBeNull()
  expect(saveButton()).toBeUndefined()
  const retry = [...host.querySelectorAll('button')].find((button) => button.textContent === '다시 시도')
  await act(() => retry.click())
  expect(titleInput().value).toBe('Existing post')
})
