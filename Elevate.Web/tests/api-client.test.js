import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, API_REQUEST_TIMEOUT_MS } from '../src/api/client';
import { getLatestAgenthonPost, listAllPosts, listPosts, listSeriesPosts, listTags } from '../src/api/posts';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('API request lifecycle', () => {
  it('preserves request options and releases timers after success or 204', async () => {
    fetch.mockResolvedValueOnce(json({ items: [] })).mockResolvedValueOnce(new Response(null, { status: 204 }));
    expect(await apiFetch('/posts', { headers: { Accept: 'application/json' } })).toEqual({ items: [] });
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/api/public/posts', expect.objectContaining({
      headers: { Accept: 'application/json' }, signal: expect.any(AbortSignal),
    }));
    expect(await apiFetch('/empty')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['headers', 'body'])('bounds a stalled response %s by the full deadline', async (stage) => {
    fetch.mockImplementation(() => stage === 'headers'
      ? new Promise(() => {})
      : Promise.resolve({ ok: true, status: 200, json: () => new Promise(() => {}) }));
    let settled = false;
    const result = apiFetch('/posts').catch((error) => { settled = true; return error; });
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toMatchObject({ code: 'RequestTimeout' });
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps caller cancellation distinct and does not start an already cancelled request', async () => {
    const controller = new AbortController();
    fetch.mockImplementation(() => new Promise(() => {}));
    const result = apiFetch('/posts', { signal: controller.signal }).catch((error) => error);
    controller.abort();
    expect(await result).toMatchObject({ name: 'AbortError' });
    await expect(apiFetch('/posts', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('times out even with a caller signal without aborting the caller', async () => {
    const controller = new AbortController();
    fetch.mockImplementation(() => new Promise(() => {}));
    const result = apiFetch('/posts', { signal: controller.signal }).catch((error) => error);
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS);
    expect(await result).toMatchObject({ code: 'RequestTimeout' });
    expect(controller.signal.aborted).toBe(false);
  });

  it.each([null, 502, 503, 504])('retries a transient GET once (%s)', async (status) => {
    if (status) fetch.mockResolvedValueOnce(json({ message: 'temporary' }, status));
    else fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fetch.mockResolvedValueOnce(json({ items: ['recovered'] }));
    const result = apiFetch('/posts');
    await vi.advanceTimersByTimeAsync(300);
    expect(await result).toEqual({ items: ['recovered'] });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not extend the deadline on retry', async () => {
    fetch.mockImplementationOnce(() => new Promise((_, reject) => {
      setTimeout(() => reject(new TypeError('Failed to fetch')), 1000);
    })).mockImplementation(() => new Promise(() => {}));
    const result = apiFetch('/posts').catch((error) => error);
    await vi.advanceTimersByTimeAsync(API_REQUEST_TIMEOUT_MS);
    expect(await result).toMatchObject({ code: 'RequestTimeout' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('stops after one failed retry and cancels a retry during backoff', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const failed = apiFetch('/posts').catch((error) => error);
    await vi.advanceTimersByTimeAsync(300);
    expect(await failed).toMatchObject({ code: 'NetworkError' });
    expect(fetch).toHaveBeenCalledTimes(2);

    const controller = new AbortController();
    const cancelled = apiFetch('/posts', { signal: controller.signal }).catch((error) => error);
    await vi.advanceTimersByTimeAsync(1);
    controller.abort();
    expect(await cancelled).toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(500);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not retry writes, 404, rate limits, or malformed JSON', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(apiFetch('/posts', { method: 'POST' })).rejects.toMatchObject({ code: 'NetworkError' });
    fetch.mockResolvedValueOnce(json({ code: 'NotFound', message: 'missing' }, 404));
    await expect(apiFetch('/posts/missing')).rejects.toMatchObject({ status: 404, code: 'NotFound', message: 'missing' });
    fetch.mockResolvedValueOnce(json({ code: 'RateLimit' }, 429));
    await expect(apiFetch('/posts')).rejects.toMatchObject({ status: 429 });
    fetch.mockResolvedValueOnce(new Response('<html>not JSON</html>'));
    await expect(apiFetch('/posts')).rejects.toMatchObject({ code: 'InvalidResponse' });
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('preserves HTTP status when an error response is not JSON', async () => {
    fetch.mockResolvedValueOnce(new Response('<html>error</html>', { status: 500 }));
    await expect(apiFetch('/posts')).rejects.toMatchObject({ status: 500 });
  });
});

describe('post query contracts', () => {
  it('preserves pagination, categories, tags, search, and series encoding', async () => {
    fetch.mockImplementation(() => Promise.resolve(json({ items: [], totalCount: 0, totalPages: 0 })));
    await listPosts({ page: 2, limit: 12, categories: ['m365', 'teams'], tag: 'a & b', q: '교육 자료' });
    const url = new URL(fetch.mock.calls[0][0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: '2', limit: '12', categories: 'm365,teams', tag: 'a & b', q: '교육 자료',
    });
    const controller = new AbortController();
    await listSeriesPosts('Forms / 시작', { signal: controller.signal });
    await listTags({ categories: ['m365'], signal: controller.signal });
    expect(fetch.mock.calls[1][0]).toContain('/series/Forms%20%2F%20%EC%8B%9C%EC%9E%91/posts');
    expect(fetch.mock.calls[2][0]).toContain('/tags?categories=m365');
  });

  it('fetches all category pages and rejects a failure instead of returning partial results', async () => {
    fetch.mockResolvedValueOnce(json({ items: [{ id: 'first' }], totalCount: 101, totalPages: 2 }))
      .mockResolvedValueOnce(json({ items: [{ id: 'last' }], totalCount: 101, totalPages: 2 }));
    expect(await listAllPosts({ category: 'm365' })).toEqual([{ id: 'first' }, { id: 'last' }]);
    expect(fetch.mock.calls[1][0]).toContain('page=2');
    fetch.mockResolvedValueOnce(json({ items: [{ id: 'first' }], totalCount: 101, totalPages: 2 }))
      .mockResolvedValueOnce(json({ message: 'failed' }, 500));
    await expect(listAllPosts({ category: 'm365' })).rejects.toMatchObject({ status: 500 });
  });

  it('rejects invalid lists instead of treating them as empty', async () => {
    fetch.mockResolvedValueOnce(json({})).mockResolvedValueOnce(json({ items: [] }));
    await expect(listPosts()).rejects.toMatchObject({ code: 'InvalidResponse' });
    await expect(listPosts()).rejects.toMatchObject({ code: 'InvalidResponse' });
  });

  it('returns the latest detail without a third request and propagates cancellation through both stages', async () => {
    const post = { id: 'latest', slug: 'latest', category: 'agenthon', title: 'Latest', contentMarkdown: '<p>Body</p>' };
    fetch.mockResolvedValueOnce(json({ items: [post], totalPages: 1, totalCount: 1 }))
      .mockResolvedValueOnce(json(post));
    expect(await getLatestAgenthonPost()).toEqual(post);
    expect(fetch).toHaveBeenCalledTimes(2);

    const controller = new AbortController();
    fetch.mockResolvedValueOnce(json({ items: [post], totalPages: 1, totalCount: 1 }))
      .mockImplementationOnce(() => new Promise(() => {}));
    const result = getLatestAgenthonPost({ signal: controller.signal }).catch((error) => error);
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    expect(await result).toMatchObject({ name: 'AbortError' });
    expect(fetch.mock.calls[3][1].signal.aborted).toBe(true);
  });
});
