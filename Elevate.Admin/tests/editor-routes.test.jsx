// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import { createPost, getPost, listAllPosts, updatePost } from '../src/services/postsApi.js'
import { getPublishedSeriesOrder } from '../src/services/publicSeriesApi.js'
import { POST_TEXT_OVERRIDES } from '../../Elevate.Web/src/constants/postText.js'

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
  usePostUpload: () => ({ ...uploadState, uploadHtmlImage: vi.fn() }),
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
  listPosts: vi.fn(), updatePost: vi.fn(),
}))
vi.mock('../src/services/publicSeriesApi.js', () => ({ getPublishedSeriesOrder: vi.fn() }))

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

const titleInput = () => host.querySelector('[placeholder="게시글 제목"]')
const bodyInput = () => host.querySelector('textarea[aria-label="HTML body"]')
const selectWith = (value) => [...host.querySelectorAll('select')]
  .find((select) => [...select.options].some((option) => option.value === value))
const appSelect = () => selectWith('github')
const statusSelect = () => selectWith('published')
const saveButton = () => [...host.querySelectorAll('button')]
  .find((button) => /^(저장|저장 중\.\.\.|이미지 업로드 중\.\.\.|첨부 업로드 중\.\.\.)$/.test(button.textContent.trim()))

async function fillNewPost({ title = 'New guide', body = '<p>Guide body</p>' } = {}) {
  await act(() => setValue(titleInput(), title))
  await act(() => setValue(bodyInput(), body))
}

async function save() {
  await act(async () => { saveButton().click() })
}

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
    thumbnail: { url: 'https://images.example.test/old.jpg' }, thumbnailUrl: 'https://images.example.test/old.jpg?sig=1',
  })
  listAllPosts.mockResolvedValue([])
  getPublishedSeriesOrder.mockResolvedValue(new Map())
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
  expect(bodyInput().value).toBe('')
  expect(host.querySelector('[data-attachment-owner]').textContent).toMatch(/^draft-/)
  expect(statusSelect().value).toBe('archived')
  expect(appSelect().value).toBe('teams')
  expect(createPost).not.toHaveBeenCalled()
})

it('offers only the title, body, app, publish state and attachments', async () => {
  await renderRoute('/posts/new?app=word')
  expect([...statusSelect().options].map((option) => [option.value, option.textContent]))
    .toEqual([['published', '게시'], ['archived', '보관']])
  expect(host.querySelector('[placeholder="my-post-slug"]')).toBeNull()
  expect(host.querySelector('[placeholder="Azure, CosmosDB"]')).toBeNull()
  expect(host.querySelector('[placeholder^="https://www.youtube.com"]')).toBeNull()
  expect(host.querySelector('input[type="file"]')).toBeNull()
  // 요약은 게시 후 AI가 본문을 읽고 기재하므로 입력 칸이 없다.
  expect(host.querySelector('[placeholder="목록 카드에 표시되는 한 줄 요약"]')).toBeNull()
  expect([...host.querySelectorAll('label')].map((node) => node.textContent.trim())).not.toContain('요약')
  expect(host.textContent).not.toMatch(/Slug|시리즈|YouTube|태그|분류|미디어|공개 사이트에서 보기|처음 게시할 때/)
  // 새 글에는 아직 썸네일이 없으므로 썸네일 칸을 보여 주지 않는다.
  expect(host.querySelector('.ea-thumb-preview')).toBeNull()
  expect([...host.querySelectorAll('p')].some((node) => node.textContent === '썸네일')).toBe(false)
})

it.each([
  ['/posts/new?app=word'],
  ['/posts/post-1'],
])('lays out %s as title, publish settings, attachments, then body so narrow screens read top to bottom', async (path) => {
  await renderRoute(path)
  const editor = host.querySelector('.ea-editor')
  const panels = [...editor.children].map((node) => [...node.classList].find((name) => name.startsWith('ea-editor__')))
  expect(panels).toEqual(['ea-editor__info', 'ea-editor__meta', 'ea-editor__files', 'ea-editor__body'])
  expect(editor.querySelector('.ea-editor__meta').textContent).toContain('게시 설정')
  expect(editor.querySelector('.ea-editor__files').textContent).toContain('첨부파일')
  expect(editor.querySelector('.ea-editor__body').contains(bodyInput())).toBe(true)
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
  const button = saveButton()
  expect(button.disabled).toBe(true)
  await act(() => button.click())
  expect(createPost).not.toHaveBeenCalled()
})

it.each([
  ['word', 'm365', ['word']],
  ['powerpoint', 'm365', ['powerpoint']],
  ['github', 'copilot-studio', ['github']],
  ['azure', 'copilot-studio', ['azure']],
  ['copilot', 'copilot', []],
])('creates a new %s post as 보관 in the %s category with the app tags %j', async (app, category, tags) => {
  await renderRoute(`/posts/new?app=${app}`)
  await fillNewPost({ title: '  New guide  ' })
  await save()
  expect(createPost).toHaveBeenCalledTimes(1)
  const [payload] = createPost.mock.calls[0]
  expect(payload).toMatchObject({ category, tags, title: 'New guide', status: 'archived', htmlBody: '<p>Guide body</p>' })
  expect(payload).not.toHaveProperty('slug')
  expect(payload).not.toHaveProperty('thumbnail')
  expect(currentPath).toBe('/posts/created-1')
})

it('changes the server category and app tag together when the app of a new post changes', async () => {
  await renderRoute('/posts/new?app=word')
  await act(() => setValue(appSelect(), 'teams'))
  await fillNewPost({ title: 'Teams guide' })
  await save()
  expect(createPost.mock.calls[0][0]).toMatchObject({ category: 'teams', tags: [] })
})

it.each([
  ['/posts/new', { title: 'No app yet' }, '앱을 선택해주세요.'],
  ['/posts/new?app=excel', { title: '   ' }, '제목을 입력해주세요.'],
  ['/posts/new?app=excel', { title: 'Empty body', body: '<p></p>' }, '본문을 입력해주세요.'],
])('validates %s before saving', async (path, fields, messageText) => {
  await renderRoute(path)
  await fillNewPost(fields)
  await save()
  expect(createPost).not.toHaveBeenCalled()
  expect(host.querySelector('[role="alert"]').textContent).toContain(messageText)
})

it('publishes a new post without drawing a thumbnail in the browser', async () => {
  await renderRoute('/posts/new?app=word')
  await fillNewPost({ title: '공동 작업 가이드', body: '<h2>공유하기</h2><p>본문</p>' })
  await act(() => setValue(statusSelect(), 'published'))
  await save()
  // 게시된 글의 썸네일과 요약은 GitHub Actions 'Post thumbnails'의 AI가 본문을 읽고 만든다.
  expect(createPost.mock.calls[0][0]).toEqual({
    title: '공동 작업 가이드', category: 'm365',
    htmlBody: '<h2>공유하기</h2><p>본문</p>', status: 'published', tags: ['word'],
  })
})

it('saves an existing post with only the editable fields and keeps its first thumbnail', async () => {
  await renderRoute('/posts/post-1')
  expect(host.querySelector('.ea-thumb-preview img').getAttribute('src')).toBe('https://images.example.test/old.jpg?sig=1')
  const loadsBeforeSave = listAllPosts.mock.calls.length
  await act(() => setValue(titleInput(), 'Edited title'))
  await save()
  expect(updatePost).toHaveBeenCalledWith('post-1', {
    title: 'Edited title', htmlBody: '<p>Existing content</p>', status: 'published',
  }, { msalInstance })
  expect(host.textContent).toContain('업데이트되었습니다.')
  expect(listAllPosts.mock.calls.length).toBeGreaterThan(loadsBeforeSave)
})

it('fills the title the public site shows and saves it without touching the summary', async () => {
  const { title, excerpt } = POST_TEXT_OVERRIDES.find((entry) => entry.title[0] === 'AI Creative Agent Team 제작하기')
  getPost.mockResolvedValue({
    id: 'post-1', title: title[0], excerpt: excerpt[0], category: 'copilot-studio', slug: 'copilotstudio',
    htmlBody: '<p>Agent team</p>', tags: [], status: 'published', series: '', updatedAt: '2026-10-13T00:09:00Z',
    thumbnail: null, thumbnailUrl: '',
  })
  await renderRoute('/posts/post-1')
  expect(titleInput().value).toBe(title[1])
  await save()
  // 요약은 보내지 않으므로 서버에 있는 요약(사람이 쓴 것이든 AI가 기재한 것이든)이 그대로 남는다.
  expect(updatePost).toHaveBeenCalledWith('post-1', {
    title: title[1], htmlBody: '<p>Agent team</p>', status: 'published',
  }, { msalInstance })
})

it('publishes an existing post without a thumbnail and leaves the image to the thumbnail pipeline', async () => {
  getPost.mockResolvedValue({
    id: 'post-2', title: 'Hidden post', category: 'copilot-studio', slug: 'github-classroom-start', htmlBody: '<p>Body</p>',
    tags: ['github'], status: 'archived', series: '', thumbnail: null, thumbnailUrl: '',
  })
  updatePost.mockResolvedValue({ id: 'post-2', status: 'published' })
  await renderRoute('/posts/post-2')
  expect(host.querySelector('.ea-thumb-preview')).toBeNull()
  await act(() => setValue(statusSelect(), 'published'))
  await save()
  expect(updatePost.mock.calls[0][1]).toEqual({ title: 'Hidden post', htmlBody: '<p>Body</p>', status: 'published' })
  expect(host.textContent).toContain('업데이트되었습니다.')
  expect(host.querySelector('.ea-thumb-preview')).toBeNull()
})

it('shows the public card image first and never replaces a thumbnail the public site already has', async () => {
  getPost.mockResolvedValue({
    id: 'post-4', title: 'Agent on GitHub Pages', category: 'copilot-studio', slug: 'github-pages', htmlBody: '<p>Body</p>',
    tags: [], status: 'archived', series: '', thumbnail: { url: 'https://images.example.test/legacy.jpg' },
    thumbnailUrl: 'https://images.example.test/legacy.jpg?sig=1',
  })
  updatePost.mockResolvedValue({ id: 'post-4', status: 'published' })
  await renderRoute('/posts/post-4')
  const preview = host.querySelector('.ea-thumb-preview img')
  expect(preview.getAttribute('src')).toMatch(/post-thumbs\/github\/github-pages-960\.webp/)
  expect(preview.getAttribute('srcset')).toMatch(/github-pages-480\.webp 480w/)

  await act(() => setValue(statusSelect(), 'published'))
  await save()
  expect(updatePost.mock.calls[0][1]).not.toHaveProperty('thumbnail')
})

it('explains instead of showing a broken image when the preview cannot load', async () => {
  await renderRoute('/posts/post-1')
  const preview = host.querySelector('.ea-thumb-preview img')
  await act(() => preview.dispatchEvent(new Event('error')))
  expect(host.querySelector('.ea-thumb-preview img')).toBeNull()
  expect(host.querySelector('.ea-thumb-preview').textContent).toBe('미리보기를 불러오지 못했습니다.')
})

it('keeps an existing draft as draft when it stays 보관', async () => {
  getPost.mockResolvedValue({
    id: 'post-3', title: 'Old draft', category: 'teams', slug: 'old-draft', htmlBody: '<p>Body</p>',
    tags: [], status: 'draft', series: '', thumbnail: null, thumbnailUrl: '',
  })
  updatePost.mockResolvedValue({ id: 'post-3', status: 'draft' })
  await renderRoute('/posts/post-3')
  expect(statusSelect().value).toBe('archived')
  await act(() => setValue(statusSelect(), 'published'))
  await act(() => setValue(statusSelect(), 'archived'))
  await save()
  expect(updatePost.mock.calls[0][1].status).toBe('draft')
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
