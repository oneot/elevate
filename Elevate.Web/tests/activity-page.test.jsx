// @vitest-environment jsdom
import { act, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ActivityShowcasePage from '../src/pages/ActivityShowcasePage';
import fallbackVideos from '../src/data/activityVideos.json';

let root;
let host;
let navigate;

function LocationProbe() {
  const location = useLocation();
  const go = useNavigate();
  useLayoutEffect(() => { navigate = go; }, [go]);
  return <output data-location>{location.pathname}{location.search}</output>;
}

async function renderRoute(path = '/activity') {
  await act(() => root.render(
    <HelmetProvider><MemoryRouter initialEntries={[path]}>
      <LocationProbe /><ActivityShowcasePage />
    </MemoryRouter></HelmetProvider>,
  ));
}

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

it('labels the existing fallback on failure and retries without changing the selected URL', async () => {
  const route = '/activity?v=QU0o1hRJP68&q=Fixture&category=행사';
  fetch.mockResolvedValue(Response.json({ message: 'Service failed' }, { status: 500 }));
  await renderRoute(route);
  expect(host.querySelector('[role="alert"]').textContent).toContain('기본 영상 목록');
  const location = host.querySelector('[data-location]').textContent;
  fetch.mockResolvedValue(Response.json({ items: [{
    videoId: 'QU0o1hRJP68', title: 'Fixture video', category: '행사', year: '2026',
  }] }));
  await act(() => host.querySelector('[role="alert"] button').click());
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector('.edoc-card__title').textContent).toBe('Fixture video');
  expect(host.querySelector('[data-location]').textContent).toBe(location);
});

it('treats a successful empty server list as empty rather than restoring fallback content', async () => {
  fetch.mockResolvedValue(Response.json({ items: [] }));
  await renderRoute();
  expect(host.querySelectorAll('.edoc-vcard')).toHaveLength(0);
  expect(host.querySelector('#edoc-theater')).toBeNull();
  expect(host.querySelector('[role="alert"]')).toBeNull();
});

it('surfaces a malformed list response rather than silently presenting fallback as current', async () => {
  fetch.mockResolvedValue(Response.json({ items: null }));
  await renderRoute();
  expect(host.querySelector('[role="alert"]').textContent).toContain('응답 형식');
});

it('keeps explicit local preview offline and ignores a late response after switching to it', async () => {
  let resolveOld;
  let signal;
  fetch.mockImplementation((_url, options) => {
    signal = options.signal;
    return new Promise((resolve) => { resolveOld = resolve; });
  });
  await renderRoute();
  await act(() => navigate('/activity?preview=local'));
  expect(signal.aborted).toBe(true);
  await act(() => resolveOld(Response.json({ items: [{ videoId: 'QU0o1hRJP68', title: 'Late response' }] })));
  expect(host.querySelectorAll('.edoc-vcard')).toHaveLength(fallbackVideos.length);
  expect(host.textContent).not.toContain('Late response');
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('does not request the API when starting in local preview', async () => {
  await renderRoute('/activity?preview=local');
  expect(fetch).not.toHaveBeenCalled();
  expect(host.querySelectorAll('.edoc-vcard')).toHaveLength(fallbackVideos.length);
});

it('keeps its own sidebar header with the home link and a plain title', async () => {
  await renderRoute('/activity?preview=local');
  const head = host.querySelector('#edoc-nav .edoc-nav__head');
  expect(head.querySelector('.edoc-nav__back').getAttribute('href')).toBe('/');
  expect(head.querySelector('.edoc-nav__title').textContent).toBe('활동 사례');
  expect(head.querySelector('img')).toBeNull();
});
