// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App.jsx'
import { listAllPosts } from '../src/services/postsApi.js'
import { BASE_CATEGORIES } from '../src/constants/apps.js'

const { auth } = vi.hoisted(() => ({
  auth: { msalInstance: {}, isAuthenticated: true, inProgress: 'none', login: null, logout: null },
}))
vi.mock('../src/hooks/useAuth.js', () => ({
  useAuth: () => ({
    msalInstance: auth.msalInstance,
    account: auth.isAuthenticated ? { name: 'Elevate 관리자', username: 'admin@microsoft-elevate.com' } : null,
    inProgress: auth.inProgress,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
  }),
}))
vi.mock('../src/services/postsApi.js', () => ({
  createPost: vi.fn(), deletePost: vi.fn(), getPost: vi.fn(), listAllPosts: vi.fn(),
  listPosts: vi.fn(), updatePost: vi.fn(),
}))

function post(id, category, extra = {}) {
  return {
    id, category, slug: id, title: `${id} title`, excerpt: '', tags: [], status: 'published',
    updatedAt: '2026-10-01T00:00:00Z', ...extra,
  }
}

// 관리자 목록 API 요약에는 series가 없다. 공개 사이트처럼 slug와 태그로 앱을 나눈다.
const POSTS = {
  m365: [
    post('signup', 'm365', { tags: ['m365', 'account'], updatedAt: '2026-10-05T00:00:00Z' }),
    post('wordonline1', 'm365', { tags: ['word', 'm365'] }),
    post('pptonline1', 'm365', { tags: ['powerpoint', 'm365'], status: 'draft' }),
    post('forms-quiz', 'm365', { tags: ['m365', 'forms'], status: 'archived' }),
    post('onedrive-mobile', 'm365', { tags: ['onedrive'] }),
  ],
  'copilot-studio': [
    post('copilotstudio', 'copilot-studio'),
    post('github-pages', 'copilot-studio'),
    post('azure-deploy', 'copilot-studio', { tags: ['Azure'], status: 'draft' }),
  ],
  teams: [post('teams-class', 'teams', { title: 'Teams 수업 만들기', excerpt: '온라인 교실' })],
}

let root
let host

async function render(path) {
  await act(() => root.render(<MemoryRouter key={path} initialEntries={[path]}><App /></MemoryRouter>))
  await act(() => vi.dynamicImportSettled())
}

const cardTitles = () => [...host.querySelectorAll('.ea-card__title')].map((node) => node.textContent)
const navBadge = (label) => [...host.querySelectorAll('.ea-nav__link')]
  .find((link) => link.querySelector('.ea-nav__label').textContent === label)
  ?.querySelector('.ea-nav__badge')?.textContent

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected external request') }))
  sessionStorage.clear()
  auth.isAuthenticated = true
  auth.inProgress = 'none'
  auth.login = vi.fn(() => Promise.resolve())
  auth.logout = vi.fn(() => Promise.resolve())
  listAllPosts.mockImplementation(({ category }) => Promise.resolve(POSTS[category] || []))
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
})

describe('app post lists', () => {
  it('loads only the seven stored app categories, never removed sub categories', async () => {
    await render('/apps/all')
    expect(listAllPosts.mock.calls.map(([options]) => options.category).sort()).toEqual([...BASE_CATEGORIES].sort())
    expect(cardTitles()).toHaveLength(9)
  })

  it('shows the 13 public apps in the navigator without sub category or management entries', async () => {
    await render('/apps/all')
    const labels = [...host.querySelectorAll('.ea-nav__label')].map((node) => node.textContent)
    expect(labels).toEqual([
      '전체 게시글', 'M365', 'Copilot', 'Copilot Studio', 'Teams', 'OneNote', 'Forms', 'OneDrive',
      'PowerPoint', 'Excel', 'Word', 'Minecraft', 'GitHub', 'Azure',
    ])
    expect(host.textContent).not.toMatch(/Sub Category|Management|활동 영상|Agenthon|행사 소식|프로그램 소식/)
    // 사이드바에는 회색 그룹 제목이나 분류 안내 문구를 두지 않는다.
    const nav = host.querySelector('#ea-nav')
    expect(nav.querySelectorAll('.ea-nav__list')).toHaveLength(1)
    expect(nav.textContent).not.toMatch(/공개 사이트와 같은 규칙/)
    expect([...nav.querySelectorAll('p')].map((node) => node.textContent)).toEqual([])
    expect(navBadge('전체 게시글')).toBe('9')
    expect(navBadge('M365')).toBe('1')
    expect(navBadge('Word')).toBe('1')
    expect(navBadge('GitHub')).toBe('1')
    expect(navBadge('Azure')).toBe('1')
    expect(navBadge('Copilot Studio')).toBe('1')
  })

  it.each([
    ['m365', ['signup title']],
    ['word', ['wordonline1 title']],
    ['powerpoint', ['pptonline1 title']],
    ['forms', ['forms-quiz title']],
    ['onedrive', ['onedrive-mobile title']],
    ['copilot-studio', ['copilotstudio title']],
    ['github', ['github-pages title']],
    ['azure', ['azure-deploy title']],
    ['teams', ['Teams 수업 만들기']],
    ['excel', []],
  ])('lists the %s app like the public site', async (app, titles) => {
    await render(`/apps/${app}`)
    expect(cardTitles()).toEqual(titles)
  })

  it('starts a new post for the current app from a Blog page without a public-site shortcut', async () => {
    await render('/apps/word')
    const newPost = [...host.querySelectorAll('a')].find((link) => link.textContent.includes('새 글 작성'))
    expect(newPost.getAttribute('href')).toBe('/posts/new?app=word')
    expect(host.querySelector('.ea-dbar__title').textContent).toBe('Blog')
    expect(host.textContent).not.toContain('공개 사이트에서 보기')
    expect(host.querySelector('.ea-hero__eyebrow')).toBeNull()
    expect(host.querySelector('.ea-hero__meta').textContent).toContain('게시 1 · 보관 0')
  })

  it('shows the public site and Admin as white glass pills in the header', async () => {
    await render('/apps/all')
    const site = host.querySelector('header a[href="https://microsoft-elevate.com/all"]')
    expect(site.className).toContain('ea-glass-pill')
    expect(site.textContent).toContain('공개 사이트')
    expect(host.querySelector('.ea-brand__badge').textContent).toBe('Admin')
  })

  it('filters by publishing state and search query kept in the address', async () => {
    await render('/apps/all?status=archived')
    // 보관에는 임시저장(draft)과 보관(archived) 글이 모두 들어간다.
    expect(cardTitles().sort()).toEqual(['azure-deploy title', 'forms-quiz title', 'pptonline1 title'])
    expect([...host.querySelectorAll('.ea-card .ea-status')].map((node) => node.textContent)).toEqual(['보관', '보관', '보관'])
    const filters = [...host.querySelectorAll('[aria-label="게시 상태"] button')].map((node) => node.textContent)
    expect(filters).toEqual(['전체9', '게시6', '보관3'])
    await render('/apps/all?status=published')
    expect(cardTitles()).toHaveLength(6)
    await render('/apps/all?q=%EC%98%A8%EB%9D%BC%EC%9D%B8')
    expect(cardTitles()).toEqual(['Teams 수업 만들기'])
    expect(host.textContent).toContain('‘온라인’ 검색 결과 1개')
  })

  it('keeps other apps visible and reports the category that failed to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    listAllPosts.mockImplementation(({ category }) => (
      category === 'teams' ? Promise.reject(new Error('Teams unavailable')) : Promise.resolve(POSTS[category] || [])
    ))
    await render('/apps/all')
    expect(cardTitles()).toHaveLength(8)
    expect(host.querySelector('[role="alert"]').textContent).toContain('Teams 게시글을 불러오지 못했습니다.')
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('teams'), expect.any(Error))
  })
})

describe('sign-in gate', () => {
  it('starts one Microsoft sign-in without calling the API while signed out', async () => {
    auth.isAuthenticated = false
    await render('/apps/all')
    expect(auth.login).toHaveBeenCalledTimes(1)
    expect(listAllPosts).not.toHaveBeenCalled()
    expect(host.textContent).toContain('Microsoft 계정 로그인 페이지로 이동하고 있습니다.')
  })

  it('shows a sign-in button instead of signing in again right after logout', async () => {
    auth.isAuthenticated = false
    sessionStorage.setItem('elevate.admin.signedOut', '1')
    await render('/apps/all')
    expect(auth.login).not.toHaveBeenCalled()
    expect(host.textContent).toContain('로그아웃되었습니다.')
    const signIn = [...host.querySelectorAll('button')].find((button) => button.textContent === '다시 로그인')
    await act(() => signIn.click())
    expect(auth.login).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem('elevate.admin.signedOut')).toBeNull()
  })

  it('waits for an ongoing MSAL interaction before signing in', async () => {
    auth.isAuthenticated = false
    auth.inProgress = 'handleRedirect'
    await render('/apps/all')
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('shows the signed-in account and signs out through MSAL', async () => {
    await render('/apps/all')
    expect(host.querySelector('.ea-account').textContent).toContain('admin@microsoft-elevate.com')
    const logout = [...host.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === '로그아웃')
    await act(() => logout.click())
    expect(auth.logout).toHaveBeenCalledTimes(1)
  })
})
