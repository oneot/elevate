import { afterEach, beforeEach, expect, it, vi } from 'vitest';

function json(items, status = 200) {
  return new Response(JSON.stringify({ items, totalPages: items.length ? 1 : 0, totalCount: items.length }), { status });
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('shares requests while allowing each consumer to cancel independently', async () => {
  const { loadApiCategoryPosts } = await import('../src/api/categoryPosts');
  const response = deferred();
  fetch.mockReturnValue(response.promise);
  const first = new AbortController();
  const second = new AbortController();
  const firstResult = loadApiCategoryPosts('m365', { signal: first.signal }).catch((error) => error);
  const secondResult = loadApiCategoryPosts('m365', { signal: second.signal });
  expect(fetch).toHaveBeenCalledTimes(1);
  first.abort();
  expect(await firstResult).toMatchObject({ name: 'AbortError' });
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(false);
  response.resolve(json([{ id: 'post', category: 'm365', title: 'Post', slug: 'test-post' }]));
  expect(await secondResult).toHaveLength(1);
});

it('cancels the transport when the final consumer leaves without deleting a replacement request', async () => {
  const { loadApiCategoryPosts } = await import('../src/api/categoryPosts');
  const old = deferred();
  const next = deferred();
  fetch.mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise);
  const controller = new AbortController();
  const oldResult = loadApiCategoryPosts('m365', { signal: controller.signal }).catch((error) => error);
  controller.abort();
  const nextResult = loadApiCategoryPosts('m365');
  expect(await oldResult).toMatchObject({ name: 'AbortError' });
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  old.resolve(json([{ id: 'stale', category: 'm365', title: 'Stale' }]));
  await vi.advanceTimersByTimeAsync(0);
  const sharedNext = loadApiCategoryPosts('m365');
  expect(fetch).toHaveBeenCalledTimes(2);
  next.resolve(json([{ id: 'fresh', category: 'm365', title: 'Fresh' }]));
  expect((await nextResult)[0].id).toBe('fresh');
  expect(await sharedNext).toEqual(await nextResult);
});

it('evicts failed or expired results instead of using empty or stale content as a fallback', async () => {
  const { loadApiCategoryPosts, snapshotPostsCache, CATEGORY_CACHE_TTL_MS } = await import('../src/api/categoryPosts');
  fetch.mockResolvedValueOnce(json([], 500));
  await expect(loadApiCategoryPosts('m365')).rejects.toMatchObject({ status: 500 });
  expect(snapshotPostsCache()).toEqual({});

  fetch.mockResolvedValueOnce(json([{ id: 'post', category: 'm365', title: 'Post' }]));
  await loadApiCategoryPosts('m365');
  await loadApiCategoryPosts('m365');
  expect(fetch).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(CATEGORY_CACHE_TTL_MS);
  expect(snapshotPostsCache()).toEqual({});
  fetch.mockResolvedValueOnce(json([], 500));
  await expect(loadApiCategoryPosts('m365')).rejects.toMatchObject({ status: 500 });
  expect(snapshotPostsCache()).toEqual({});

  fetch.mockResolvedValueOnce(json([]));
  expect(await loadApiCategoryPosts('m365')).toEqual([]);
  expect(snapshotPostsCache().m365).toEqual([]);
});

it('bounds a shared stalled request and allows a fresh retry after timeout', async () => {
  const { loadApiCategoryPosts } = await import('../src/api/categoryPosts');
  const { API_REQUEST_TIMEOUT_MS } = await import('../src/api/client');
  fetch.mockReturnValueOnce(new Promise(() => {}));
  const first = loadApiCategoryPosts('m365').catch((error) => error);
  const second = loadApiCategoryPosts('m365').catch((error) => error);
  await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS);
  expect(await first).toMatchObject({ code: 'RequestTimeout' });
  expect(await second).toMatchObject({ code: 'RequestTimeout' });
  fetch.mockResolvedValueOnce(json([]));
  expect(await loadApiCategoryPosts('m365')).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('preserves split categories, series and newest-first ordering', async () => {
  const { loadCategoryPosts, loadApiCategoryPosts } = await import('../src/api/categoryPosts');
  fetch.mockResolvedValueOnce(json([
    { id: 'old', category: 'm365', title: 'Old', slug: 'test-old', publishedAt: '2026-01-01' },
    { id: 'forms-first', category: 'm365', title: 'First', slug: 'test-first', series: 'Forms 입문 가이드', seriesOrder: 1, publishedAt: '2026-02-01' },
    { id: 'forms-last', category: 'm365', title: 'Last', slug: 'test-last', series: 'Forms 입문 가이드', seriesOrder: 2, publishedAt: '2026-02-01' },
  ]));
  expect((await loadCategoryPosts('forms')).map((post) => post.id)).toEqual(['forms-last', 'forms-first']);
  expect((await loadCategoryPosts('m365')).map((post) => post.id)).toEqual(['old']);
  expect((await loadApiCategoryPosts('m365'))[0]).toMatchObject({ category: 'forms', serverTitle: 'Last' });
  expect(fetch).toHaveBeenCalledTimes(1);
});
