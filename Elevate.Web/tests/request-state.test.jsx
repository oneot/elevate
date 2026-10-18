// @vitest-environment jsdom
import { act, StrictMode, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useApiResource } from '../src/hooks/useApiResource';
import { useCategoryPosts } from '../src/components/elevate-docs/docsHooks';

let host;
let root;
let state;

function Probe({ load }) {
  const resource = useApiResource(load);
  useLayoutEffect(() => { state = resource; }, [resource]);
  return <p>{resource.loading ? 'loading' : resource.error ? resource.error.message : resource.data?.title}</p>;
}

function CategoryProbe() {
  const categories = useCategoryPosts();
  useLayoutEffect(() => { state = categories; }, [categories]);
  return null;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
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

it('does not let a cancelled request finish the next request loading state or overwrite its result', async () => {
  const old = deferred();
  const next = deferred();
  const oldLoad = vi.fn(() => old.promise);
  const nextLoad = vi.fn(() => next.promise);
  await act(() => root.render(<Probe load={oldLoad} />));
  await act(() => root.render(<Probe load={nextLoad} />));
  expect(oldLoad.mock.calls[0][0].aborted).toBe(true);
  await act(() => old.resolve({ title: 'Old' }));
  expect(state.loading).toBe(true);
  expect(state.data).toBeNull();
  await act(() => next.resolve({ title: 'Current' }));
  expect(host.textContent).toBe('Current');
});

it('ignores late failures and hides the previous post immediately on route changes', async () => {
  const old = deferred();
  const oldLoad = () => old.promise;
  const nextLoad = () => Promise.resolve({ title: 'Current' });
  await act(() => root.render(<Probe load={oldLoad} />));
  await act(() => root.render(<Probe load={nextLoad} />));
  await act(() => old.reject(new Error('Stale failure')));
  expect(host.textContent).toBe('Current');
  expect(console.warn).not.toHaveBeenCalled();
  const pending = () => new Promise(() => {});
  await act(() => root.render(<Probe load={pending} />));
  expect(state.data).toBeNull();
  expect(host.textContent).toBe('loading');
});

it('exposes a failure and retries the same loader without stale data', async () => {
  const load = vi.fn().mockRejectedValueOnce(new Error('Network unavailable'))
    .mockResolvedValueOnce({ title: 'Recovered' });
  await act(() => root.render(<Probe load={load} />));
  expect(state.error.message).toBe('Network unavailable');
  expect(state.loading).toBe(false);
  expect(load.mock.calls[0][0].aborted).toBe(true);
  await act(() => state.retry());
  expect(host.textContent).toBe('Recovered');
  expect(state.error).toBeNull();
  expect(load).toHaveBeenCalledTimes(2);
});

it('cleans up StrictMode and unmounted requests', async () => {
  const load = vi.fn(() => new Promise(() => {}));
  await act(() => root.render(<StrictMode><Probe load={load} /></StrictMode>));
  expect(load).toHaveBeenCalledTimes(2);
  expect(load.mock.calls[0][0].aborted).toBe(true);
  expect(load.mock.calls[1][0].aborted).toBe(false);
  await act(() => root.render(null));
  expect(load.mock.calls[1][0].aborted).toBe(true);
});

it('keeps sidebar failure distinct from an empty category and supports retry', async () => {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Unavailable' }), { status: 500 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ items: [], totalPages: 0, totalCount: 0 }))));
  await act(() => root.render(<CategoryProbe />));
  await act(() => state.ensure('sidebar-test'));
  expect(state.postsMap['sidebar-test']).toBeUndefined();
  expect(state.errorsMap['sidebar-test']).toBe('Unavailable');
  await act(() => state.ensure('sidebar-test'));
  expect(state.postsMap['sidebar-test']).toEqual([]);
  expect(state.errorsMap['sidebar-test']).toBeUndefined();
});
