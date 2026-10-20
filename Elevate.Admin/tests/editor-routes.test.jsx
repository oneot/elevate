// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import { createPost, getPost, listAllPosts, updatePost } from '../src/services/postsApi.js'
import { renderAutoThumbnail } from '../src/utils/autoThumbnail.js'

const { msalInstance, uploadState, uploadThumbnailFile } = vi.hoisted(() => ({
  msalInstance: {}, uploadState: { uploading: false }, uploadThumbnailFile: vi.fn(),
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
  usePostUpload: () => ({ ...uploadState, uploadThumbnailFile, uploadHtmlImage: vi.fn() }),
}))
vi.mock('../src/utils/autoThumbnail.js', () => ({ renderAutoThumbnail: vi.fn() }))
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

const GENERATED_FILE = new File(['png'], 'auto-thumbnail.png', { type: 'image/png' })
const GENERATED_THUMBNAIL = {
  url: 'https://images.example.test/uploads/thumb.jpg',
  signedUrl: 'https://images.example.test/uploads/thumb.jpg?sig=1',
  variants: { thumb: { url: 'a', width: 480 }, card: { url: 'b', width: 960 }, hero: { url: 'c', width: 1440 } },
}

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
const excerptInput = () => host.querySelector('[placeholder="목록 카드에 표시되는 한 줄 요약"]')
const bodyInput = () => host.querySelector('textarea[aria-label="HTML body"]')
const selectWith = (value) => [...host.querySelectorAll('select')]
  .find((select) => [...select.options].some((option) => option.value === value))
const appSelect = () => selectWith('github')
const statusSelect = () => selectWith('published')
const saveButton = () => [...host.querySelectorAll('button')]
  .find((button) => /^(저장|저장 중\.\.\.|이미지 업로드 중\.\.\.|첨부 업로드 중\.\.\.)$/.test(button.textContent.trim()))

async function fillNewPost({ title = 'New guide', body = '<p>Guide body</p>', excerpt } = {}) {
  await act(() => setValue(titleInput(), title))
  if (excerpt !== undefined) await act(() => setValue(excerptInput(), excerpt))
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
  createPost.mockResolvedValue({ id: 'created-1' })
  updatePost.mockResolvedValue({ id: 'post-1', status: 'published', slug: 'existing-post', updatedAt: '2026-10-20T01:00:00Z' })
  renderAutoThumbnail.mockResolvedValue(GENERATED_FILE)
  uploadThumbnailFile.mockResolvedValue(GENERATED_THUMBNAIL)
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

it('offers only the title, summary, body, app, publish state and attachments', async () => {
  await renderRoute('/posts/new?app=word')
  expect([...statusSelect().options].map((option) => [option.value, option.textContent]))
    .toEqual([['published', '게시'], ['archived', '보관']])
  expect(host.querySelector('[placeholder="my-post-slug"]')).toBeNull()
  expect(host.querySelector('[placeholder="Azure, CosmosDB"]')).toBeNull()
  expect(host.querySelector('[placeholder^="https://www.youtube.com"]')).toBeNull()
  expect(host.querySelector('input[type="file"]')).toBeNull()
  expect(host.textContent).not.toMatch(/Slug|시리즈|YouTube|태그|분류|미디어|공개 사이트에서 보기|처음 게시할 때/)
  // 새 글에는 아직 썸네일이 없으므로 썸네일 칸을 보여 주지 않는다.
  expect(host.querySelector('.ea-thumb-preview')).toBeNull()
  expect([...host.querySelectorAll('p')].some((node) => node.textContent === '썸네일')).toBe(false)
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
  expect(payload.thumbnail).toBeNull()
  expect(renderAutoThumbnail).not.toHaveBeenCalled()
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

it('creates the thumbnail from the post content when a new post is published', async () => {
  await renderRoute('/posts/new?app=word')
  await fillNewPost({ title: '공동 작업 가이드', excerpt: '링크 하나로 함께 편집합니다.', body: '<h2>공유하기</h2><p>본문</p>' })
  await act(() => setValue(statusSelect(), 'published'))
  await save()
  expect(renderAutoThumbnail).toHaveBeenCalledWith({
    app: 'word', title: '공동 작업 가이드', excerpt: '링크 하나로 함께 편집합니다.', html: '<h2>공유하기</h2><p>본문</p>',
  })
  expect(uploadThumbnailFile).toHaveBeenCalledWith(GENERATED_FILE, { alt: '공동 작업 가이드' })
  expect(createPost.mock.calls[0][0]).toMatchObject({ status: 'published', thumbnail: GENERATED_THUMBNAIL, category: 'm365', tags: ['word'] })
})

it('saves an existing post with only the editable fields and keeps its first thumbnail', async () => {
  await renderRoute('/posts/post-1')
  expect(host.querySelector('.ea-thumb-preview img').getAttribute('src')).toBe('https://images.example.test/old.jpg?sig=1')
  const loadsBeforeSave = listAllPosts.mock.calls.length
  await act(() => setValue(titleInput(), 'Edited title'))
  await save()
  expect(renderAutoThumbnail).not.toHaveBeenCalled()
  expect(updatePost).toHaveBeenCalledWith('post-1', {
    title: 'Edited title', excerpt: '', htmlBody: '<p>Existing content</p>', status: 'published', thumbnail: null,
  }, { msalInstance })
  expect(host.textContent).toContain('업데이트되었습니다.')
  expect(listAllPosts.mock.calls.length).toBeGreaterThan(loadsBeforeSave)
})

it('creates a thumbnail only once when an existing post without one is published', async () => {
  getPost.mockResolvedValue({
    id: 'post-2', title: 'Hidden post', category: 'copilot-studio', slug: 'github-classroom-start', htmlBody: '<p>Body</p>',
    tags: ['github'], status: 'archived', series: '', thumbnail: null, thumbnailUrl: '',
  })
  updatePost.mockResolvedValue({
    id: 'post-2', status: 'published', thumbnail: GENERATED_THUMBNAIL, thumbnailUrl: GENERATED_THUMBNAIL.signedUrl,
  })
  await renderRoute('/posts/post-2')
  await act(() => setValue(statusSelect(), 'published'))
  await save()
  expect(renderAutoThumbnail).toHaveBeenCalledWith(expect.objectContaining({ app: 'github', title: 'Hidden post' }))
  expect(updatePost.mock.calls[0][1]).toMatchObject({ status: 'published', thumbnail: GENERATED_THUMBNAIL })
  expect(host.textContent).toContain('본문 내용으로 썸네일을 만들었습니다.')
  expect(host.querySelector('.ea-thumb-preview img').getAttribute('src')).toBe(GENERATED_THUMBNAIL.signedUrl)

  await act(() => setValue(titleInput(), 'Edited after publishing'))
  await save()
  expect(renderAutoThumbnail).toHaveBeenCalledTimes(1)
  expect(updatePost.mock.calls[1][1].thumbnail).toBeNull()
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
  expect(renderAutoThumbnail).not.toHaveBeenCalled()
  expect(updatePost.mock.calls[0][1]).toMatchObject({ status: 'published', thumbnail: null })
})

it('explains instead of showing a broken image when the preview cannot load', async () => {
  await renderRoute('/posts/post-1')
  const preview = host.querySelector('.ea-thumb-preview img')
  await act(() => preview.dispatchEvent(new Event('error')))
  expect(host.querySelector('.ea-thumb-preview img')).toBeNull()
  expect(host.querySelector('.ea-thumb-preview').textContent).toBe('미리보기를 불러오지 못했습니다.')
})

it('still saves the post and explains when the thumbnail cannot be created', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  renderAutoThumbnail.mockRejectedValue(new Error('canvas unavailable'))
  await renderRoute('/posts/new?app=excel')
  await fillNewPost({ title: 'Grades' })
  await act(() => setValue(statusSelect(), 'published'))
  await save()
  expect(createPost.mock.calls[0][0]).toMatchObject({ status: 'published', thumbnail: null })
  expect(host.textContent).toContain('썸네일을 자동으로 만들지 못했습니다.')
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
  expect(renderAutoThumbnail).not.toHaveBeenCalled()
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
