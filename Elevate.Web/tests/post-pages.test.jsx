// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import PostList from '../src/pages/PostList';
import PostDetail from '../src/pages/PostDetail';
import Microsoft365Update from '../src/pages/Microsoft365Update';
import ProgramNews from '../src/pages/ProgramNews';
import { API_REQUEST_TIMEOUT_MS } from '../src/api/client';
import { CATEGORY_CACHE_TTL_MS } from '../src/api/categoryPosts';
import { getDocsMeta } from '../src/components/elevate-docs/docsMeta';

let root;
let host;
let navigate;
let sequence = 0;

function LocationProbe() {
  const location = useLocation();
  const go = useNavigate();
  useLayoutEffect(() => { navigate = go; }, [go]);
  return <output data-location>{location.pathname}{location.search}</output>;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function post(id, category = 'm365') {
  return {
    id, category, slug: `test-${id}`, title: `Title ${id}`, excerpt: `Excerpt ${id}`,
    contentMarkdown: `<h2>Body ${id}</h2><p>Content ${id}</p>`, publishedAt: '2026-01-01',
  };
}

function emptyList() {
  return json({ items: [], totalCount: 0, totalPages: 0 });
}

async function renderRoute(route) {
  await act(() => root.render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[route]}>
        <LocationProbe />
        <Routes>
          <Route path="/update" element={<Microsoft365Update />} />
          <Route path="/program-news" element={<ProgramNews />} />
          <Route path="/agenthon" element={<PostDetail categoryProp="agenthon" useLatest />} />
          <Route path="/:category" element={<PostList />} />
          <Route path="/:category/:postId" element={<PostDetail />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  ));
}

function retryButton() {
  return host.querySelector('.edoc-empty button');
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 18).getTime() + (++sequence * CATEGORY_CACHE_TTL_MS * 2));
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: true, addEventListener() {}, removeEventListener() {},
  })));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('ends a stalled /all load, avoids speculative sidebar traffic, and retries the same page into real cards', async () => {
  fetch.mockImplementation(() => new Promise(() => {}));
  await renderRoute('/all?page=2');
  expect(host.querySelectorAll('.edoc-card')).toHaveLength(12);
  await act(() => vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS));
  expect(host.querySelectorAll('.edoc-card')).toHaveLength(0);
  expect(host.querySelector('[role="alert"]').textContent).toContain('서버 응답 시간이 초과');
  expect(host.textContent).not.toContain('불러오는 중');
  expect(fetch).toHaveBeenCalledTimes(1);

  fetch.mockImplementation((url) => Promise.resolve(new URL(url).searchParams.has('categories')
    ? json({ items: Array.from({ length: 12 }, (_, index) => post(`page2-${index}`)), totalCount: 24, totalPages: 2 })
    : emptyList()));
  await act(() => retryButton().click());
  expect(host.querySelectorAll('.edoc-card__title')).toHaveLength(12);
  expect(host.querySelector('[data-location]').textContent).toBe('/all?page=2');
  expect(new URL(fetch.mock.calls[1][0]).searchParams.get('page')).toBe('2');
  expect(host.querySelector('.edoc-pager__num[aria-current="page"]').textContent).toBe('2');
});

it('keeps pagination navigation and split-category display-title search working', async () => {
  fetch.mockImplementation((url) => {
    const query = new URL(url).searchParams;
    if (query.has('categories')) return Promise.resolve(json({
      items: [post(query.get('page') === '2' ? 'second' : 'first')], totalCount: 13, totalPages: 2,
    }));
    if (query.get('category') === 'm365') return Promise.resolve(json({
      items: [
        { ...post('forms-match'), series: 'Forms 입문 가이드', excerpt: '찾기 연습' },
        { ...post('other'), excerpt: '찾기 연습' },
      ], totalCount: 2, totalPages: 1,
    }));
    return Promise.resolve(emptyList());
  });
  await renderRoute('/all');
  await act(() => host.querySelector('.edoc-pager__num[aria-label="2 페이지"]').click());
  expect(host.querySelector('[data-location]').textContent).toBe('/all?page=2');
  expect(host.querySelector('.edoc-card__title').textContent).toBe('Title second');
  await act(() => navigate('/forms?q=찾기'));
  expect(host.querySelectorAll('.edoc-card__title')).toHaveLength(1);
  expect(host.querySelector('.edoc-card__link').getAttribute('href')).toBe('/forms/test-forms-match');
  await act(() => navigate('/all?q=찾기'));
  expect(host.querySelectorAll('.edoc-card__title')).toHaveLength(2);
});

it('shows a retryable detail error instead of a 404 and recovers the article', async () => {
  fetch.mockResolvedValueOnce(json({ message: 'Server unavailable' }, 500));
  await renderRoute('/m365/test-detail');
  expect(host.querySelector('[role="alert"]').textContent).toContain('Server unavailable');
  expect(host.textContent).not.toContain('404');
  expect(host.querySelector('.edoc-article')).toBeNull();
  fetch.mockImplementation((url) => Promise.resolve(new URL(url).pathname.endsWith('/posts')
    ? emptyList() : json(post('detail'))));
  await act(() => retryButton().click());
  expect(host.querySelector('.edoc-article').textContent).toContain('Content detail');
  expect(host.querySelector('.edoc-empty[role="alert"]')).toBeNull();
});

it('keeps a genuine missing post as a 404', async () => {
  fetch.mockResolvedValueOnce(json({ code: 'NotFound', message: 'Resource not found' }, 404));
  await renderRoute('/m365/test-missing');
  expect(host.textContent).toContain('404');
  expect(retryButton()).toBeNull();
});

it('does not let a late old detail or abort end the next route loading state', async () => {
  let oldResponse;
  let nextResponse;
  fetch.mockImplementation((url) => {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith('/test-old')) return new Promise((resolve) => { oldResponse = resolve; });
    if (pathname.endsWith('/test-next')) return new Promise((resolve) => { nextResponse = resolve; });
    return Promise.resolve(emptyList());
  });
  await renderRoute('/m365/test-old');
  await act(() => navigate('/teams/test-next'));
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  await act(() => oldResponse(json(post('old'))));
  expect(host.querySelector('.edoc-article')).toBeNull();
  expect(host.querySelector('.edoc-skel')).not.toBeNull();
  await act(() => nextResponse(json(post('next', 'teams'))));
  expect(host.querySelector('.edoc-article').textContent).toContain('Content next');
  expect(host.textContent).not.toContain('Title old');
  expect(host.querySelector('[data-location]').textContent).toBe('/teams/test-next');
});

it('renders /agenthon from its first detail response without refetching that detail', async () => {
  const latest = post('latest', 'agenthon');
  fetch.mockImplementation((url) => Promise.resolve(new URL(url).pathname.endsWith('/posts')
    ? json({ items: [latest], totalCount: 1, totalPages: 1 })
    : json(latest)));
  await renderRoute('/agenthon');
  expect(host.querySelector('.edoc-article').textContent).toContain('Content latest');
  expect(fetch.mock.calls.filter(([url]) => new URL(url).pathname.endsWith('/agenthon/test-latest'))).toHaveLength(1);
  expect(fetch.mock.calls.filter(([url]) => new URL(url).searchParams.get('limit') === '1')).toHaveLength(1);
});

it('preserves update search, normalized tags and pagination when retrying', async () => {
  fetch.mockResolvedValueOnce(json({ message: 'Unavailable' }, 500));
  await renderRoute('/update?q=Title&tags=word&page=2');
  expect(host.querySelector('[role="alert"]').textContent).toContain('Unavailable');
  fetch.mockResolvedValueOnce(json({
    items: Array.from({ length: 21 }, (_, index) => ({ ...post(`update-${index}`, 'update'), tags: [' Word '] })),
    totalCount: 21, totalPages: 1,
  }));
  const button = [...host.querySelectorAll('button')].find((item) => item.textContent === '다시 시도');
  await act(() => button.click());
  expect(host.textContent).toContain('Title update-20');
  expect(host.textContent).not.toContain('Title update-0');
  expect(host.querySelector('[data-location]').textContent).toBe('/update?q=Title&tags=word&page=2');
});

it('shows calendar failure separately and retries it without hiding or refetching posts', async () => {
  fetch.mockImplementation((url) => Promise.resolve(new URL(url).pathname.endsWith('/calendar-events')
    ? json({ message: 'Calendar unavailable' }, 500)
    : json({ items: [post('event', 'event')], totalCount: 1, totalPages: 1 })));
  await renderRoute('/program-news?tab=event');
  expect(host.textContent).toContain('Title event');
  expect(host.querySelector('[role="alert"]').textContent).toContain('Calendar unavailable');
  fetch.mockImplementation(() => Promise.resolve(json({ items: [] })));
  const button = [...host.querySelectorAll('button')].find((item) => item.textContent === '일정 다시 시도');
  await act(() => button.click());
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).toContain('Title event');
  expect(fetch.mock.calls.filter(([url]) => new URL(url).pathname.endsWith('/posts'))).toHaveLength(1);
});

function serve(item) {
  return (url) => Promise.resolve(new URL(url).pathname.endsWith('/posts')
    ? json({ items: [item], totalCount: 1, totalPages: 1 })
    : json(item));
}

it('lists categories without a sidebar back link or visible heading while keeping the group name and other routes', async () => {
  fetch.mockImplementation(() => Promise.resolve(emptyList()));
  await renderRoute('/all');
  for (const route of ['/all', '/m365']) {
    if (route !== '/all') await act(() => navigate(route));
    const nav = host.querySelector('#edoc-nav');
    expect(nav.querySelector('.edoc-nav__back, .edoc-nav__head, .edoc-nav__heading')).toBeNull();
    expect(nav.querySelector('[role="group"]').getAttribute('aria-label')).toBe('카테고리');
    expect(nav.textContent).not.toContain('카테고리');
    expect(nav.querySelector('.edoc-nav__row[data-active="true"]').textContent).toContain(route === '/all' ? '전체 게시글' : 'M365');
    expect(host.querySelector('.edoc-dbar__title').getAttribute('href')).toBe('/all');
    expect(host.querySelector('a[href="/"]').textContent).toContain('Microsoft');
  }
  expect(host.querySelector('.edoc-hero__eyebrow').textContent).toBe('카테고리');
});

it.each([
  ['m365', 'M365'],
  ['copilot-studio', 'Copilot Studio'],
])('shows the %s app icon before the detail sidebar title without a back link', async (category, name) => {
  fetch.mockImplementation(serve(post('detail', category)));
  await renderRoute(`/${category}/test-detail`);
  const nav = host.querySelector('#edoc-nav');
  expect(nav.querySelector('.edoc-nav__back')).toBeNull();
  const title = nav.querySelector('.edoc-nav__title');
  expect(title.getAttribute('href')).toBe(`/${category}`);
  expect(title.textContent).toBe(name);
  const icon = title.querySelector('img');
  expect(icon.getAttribute('src')).toBe(getDocsMeta(category).icon);
  expect(icon.getAttribute('alt')).toBe('');
  expect(nav.querySelector('.edoc-nav__subtitle').textContent).toBe('게시글 1개 · 최신순');
  expect(host.querySelector('.edoc-dbar__title').getAttribute('href')).toBe('/all');
  expect([...host.querySelectorAll('.edoc-crumbs a')].map((link) => link.getAttribute('href'))).toEqual(['/all', `/${category}`]);
});

it('keeps icon-less sections as a plain sidebar title while all posts stay reachable from the blog menu', async () => {
  fetch.mockImplementation(serve(post('news', 'update')));
  await renderRoute('/update/test-news');
  const nav = host.querySelector('#edoc-nav');
  expect(nav.querySelector('.edoc-nav__back')).toBeNull();
  const title = nav.querySelector('.edoc-nav__title');
  expect(title.textContent).toBe('업데이트');
  expect(title.querySelector('img')).toBeNull();
  expect(host.querySelector('.edoc-dbar__title').getAttribute('href')).toBe('/update');
  const blogMenu = [...host.querySelectorAll('nav a')].find((link) => link.textContent === '블로그');
  expect(blogMenu.getAttribute('href')).toBe('/all');
});

it('leaves the failed-detail sidebar without a back link because the doc bar still returns to all posts', async () => {
  fetch.mockResolvedValueOnce(json({ message: 'Server unavailable' }, 500));
  await renderRoute('/m365/test-detail');
  const nav = host.querySelector('#edoc-nav');
  expect(nav.textContent).toContain('게시글을 불러오지 못했습니다.');
  expect(nav.querySelector('.edoc-nav__back, .edoc-nav__head')).toBeNull();
  expect(host.querySelector('.edoc-dbar__title').getAttribute('href')).toBe('/all');
});
