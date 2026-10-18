import { listAllPosts } from './posts';
import { getApiCategory, getDisplayCategoriesForApi, toDisplayPost } from '../constants/categories';

export const CATEGORY_CACHE_TTL_MS = 60_000;
const postsCache = new Map();
const titleCollator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

function publishedTime(post) {
  const time = Date.parse(post?.publishedAt || '');
  return Number.isFinite(time) ? time : 0;
}

export function sortByPublishedDesc(posts) {
  return [...posts].sort((a, b) => (
    publishedTime(b) - publishedTime(a)
    || (b.seriesOrder ?? -Infinity) - (a.seriesOrder ?? -Infinity)
    || titleCollator.compare(b.serverTitle || b.title || '', a.serverTitle || a.title || '')
  ));
}

export function groupByDisplayCategory(apiCategory, items) {
  return Object.fromEntries(getDisplayCategoriesForApi(apiCategory).map((category) => [
    category, items.filter((post) => post.category === category),
  ]));
}

export function snapshotPostsCache() {
  let snapshot = {};
  postsCache.forEach((entry, apiCategory) => {
    if (entry.items && entry.expiresAt > Date.now()) {
      snapshot = { ...snapshot, ...groupByDisplayCategory(apiCategory, entry.items) };
    }
  });
  return snapshot;
}

export function loadApiCategoryPosts(apiCategory, { signal } = {}) {
  if (signal?.aborted) return Promise.reject(signal.reason);
  let entry = postsCache.get(apiCategory);
  if (entry?.items && entry.expiresAt > Date.now()) return Promise.resolve(entry.items);

  if (!entry || entry.items) {
    entry = { controller: new AbortController(), consumers: 0 };
    postsCache.set(apiCategory, entry);
    entry.promise = listAllPosts({ category: apiCategory, signal: entry.controller.signal })
      .then((items) => {
        if (entry.controller.signal.aborted) throw entry.controller.signal.reason;
        entry.items = sortByPublishedDesc(items.map(toDisplayPost));
        entry.expiresAt = Date.now() + CATEGORY_CACHE_TTL_MS;
        return entry.items;
      })
      .catch((error) => {
        if (postsCache.get(apiCategory) === entry) postsCache.delete(apiCategory);
        throw error;
      });
  }

  // A sidebar and a page can share the request without cancelling each other.
  return new Promise((resolve, reject) => {
    entry.consumers += 1;
    let finished = false;
    const finish = (settle, value) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener('abort', cancel);
      entry.consumers -= 1;
      if (!entry.items && entry.consumers === 0) {
        if (postsCache.get(apiCategory) === entry) postsCache.delete(apiCategory);
        entry.controller.abort();
      }
      settle(value);
    };
    const cancel = () => finish(reject, signal.reason);
    signal?.addEventListener('abort', cancel, { once: true });
    entry.promise.then((items) => finish(resolve, items), (error) => finish(reject, error));
  });
}

export async function loadCategoryPosts(category, options) {
  const items = await loadApiCategoryPosts(getApiCategory(category), options);
  return items.filter((post) => post.category === category);
}
