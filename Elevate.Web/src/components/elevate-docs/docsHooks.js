/**
 * @file docsHooks.js
 * @description Hooks shared by the docs-style blog pages: cached per-category post loading
 * (newest first), post outline extraction and scroll-spy for the left navigator.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { groupByDisplayCategory, loadApiCategoryPosts, snapshotPostsCache } from '../../api/categoryPosts';
import { getApiCategory, getDisplayCategoriesForApi } from '../../constants/categories';
import { getPostContentHeadings } from '../../utils/html';

/* ------------------------------------------------------------------ */
/* Posts per category                                                 */
/* ------------------------------------------------------------------ */

function withoutCategories(map, categories) {
  const next = { ...map };
  categories.forEach((category) => { delete next[category]; });
  return next;
}

/**
 * 카테고리별 게시글 목록을 필요할 때 불러온다. `ensure(category)`는 여러 번 불러도 안전하다.
 * @returns {{ postsMap: Record<string, Array>, errorsMap: Record<string, string>, ensure: Function }}
 */
export function useCategoryPosts() {
  const [state, setState] = useState(() => ({ postsMap: snapshotPostsCache(), errorsMap: {} }));
  const requestsRef = useRef(new Map());

  useEffect(() => {
    const requests = requestsRef.current;
    return () => {
      requests.forEach((controller) => controller.abort());
      requests.clear();
    };
  }, []);

  const ensure = useCallback((category) => {
    if (!category || category === 'all') return;
    const apiCategory = getApiCategory(category);
    if (requestsRef.current.has(apiCategory)) return;
    const categories = getDisplayCategoriesForApi(apiCategory);
    const controller = new AbortController();
    requestsRef.current.set(apiCategory, controller);
    const cached = snapshotPostsCache();
    setState((prev) => ({
      postsMap: {
        ...withoutCategories(prev.postsMap, categories),
        ...Object.fromEntries(categories.filter((key) => cached[key]).map((key) => [key, cached[key]])),
      },
      errorsMap: withoutCategories(prev.errorsMap, categories),
    }));
    loadApiCategoryPosts(apiCategory, { signal: controller.signal })
      .then((items) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          postsMap: { ...prev.postsMap, ...groupByDisplayCategory(apiCategory, items) },
          errorsMap: withoutCategories(prev.errorsMap, categories),
        }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.warn('[useCategoryPosts] 요청 실패:', error.code || error.status || error.name);
        setState((prev) => ({
          postsMap: withoutCategories(prev.postsMap, categories),
          errorsMap: {
            ...prev.errorsMap,
            ...Object.fromEntries(categories.map((key) => [key, error.message || '목록을 불러오지 못했습니다.'])),
          },
        }));
      })
      .finally(() => {
        if (requestsRef.current.get(apiCategory) === controller) requestsRef.current.delete(apiCategory);
      });
  }, []);

  return { ...state, ensure };
}

/* ------------------------------------------------------------------ */
/* Outline                                                             */
/* ------------------------------------------------------------------ */

function buildHeadingTree(flat) {
  const roots = [];
  const stack = [];
  flat.forEach((heading) => {
    while (stack.length && stack[stack.length - 1].level >= heading.level) stack.pop();
    const node = { ...heading, children: [] };
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  });
  return roots;
}

/**
 * Extracts h1–h3 headings (ids are already injected by preparePostHtml) and an
 * estimated reading time from the prepared post HTML.
 */
export function usePostOutline(html) {
  return useMemo(() => {
    if (!html || typeof document === 'undefined') return { headings: [], tree: [], minutes: 0 };
    const template = document.createElement('template');
    template.innerHTML = html;
    const headings = getPostContentHeadings(template.content)
      .map((heading) => ({ ...heading, text: heading.text.replace(/\s+/g, ' ').trim() }))
      .filter((heading) => heading.text);
    // Code blocks are copy-paste material rather than reading, so they don't count toward reading time.
    template.content.querySelectorAll('pre').forEach((block) => block.remove());
    const chars = (template.content.textContent || '').replace(/\s+/g, '').length;
    return {
      headings,
      tree: buildHeadingTree(headings),
      minutes: Math.max(1, Math.round(chars / 500)),
    };
  }, [html]);
}

/* ------------------------------------------------------------------ */
/* Scroll spy                                                          */
/* ------------------------------------------------------------------ */

/**
 * Tracks which heading the reader is in. `lockTo(id)` pins the result while a
 * smooth scroll triggered by a navigator click is in flight.
 */
export function useScrollSpy(ids, extraOffset = 48) {
  const key = ids.join('\n');
  const [activeId, setActiveId] = useState('');
  const lockRef = useRef(null);

  useEffect(() => {
    const list = key ? key.split('\n') : [];
    let frame = 0;

    const compute = () => {
      frame = 0;
      const lock = lockRef.current;
      if (lock) {
        if (performance.now() < lock.until) return;
        lockRef.current = null;
      }
      const bar = document.querySelector('.edoc-dbar');
      const offset = (bar ? bar.getBoundingClientRect().bottom : 0) + extraOffset;
      let current = '';
      for (const id of list) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= offset) current = id;
        else break;
      }
      const doc = document.documentElement;
      const last = list.length ? document.getElementById(list[list.length - 1]) : null;
      if (
        last &&
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2 &&
        last.getBoundingClientRect().top < window.innerHeight
      ) {
        current = list[list.length - 1];
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const schedule = () => {
      const lock = lockRef.current;
      if (lock) lock.until = Math.min(lock.max, Math.max(lock.until, performance.now() + 160));
      if (!frame) frame = requestAnimationFrame(compute);
    };

    const release = () => {
      if (!lockRef.current) return;
      lockRef.current = null;
      schedule();
    };

    frame = requestAnimationFrame(compute);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('wheel', release, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('keydown', release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('keydown', release);
    };
  }, [key, extraOffset]);

  const lockTo = useCallback((id) => {
    const now = performance.now();
    lockRef.current = { until: now + 450, max: now + 4000 };
    setActiveId(id);
  }, []);

  return [activeId, lockTo];
}

/**
 * Smooth-scrolls to `element`, then keeps it pinned under the doc bar while lazily loaded
 * images above it finish loading and shift the layout. Stops as soon as the reader scrolls
 * or presses a key, or after `pinMs`.
 */
export function scrollToElementSettled(element, pinMs = 2500) {
  let timer = 0;
  let observer = null;
  let pinUntil = 0;

  const offsetFromTarget = () =>
    element.getBoundingClientRect().top - (parseFloat(getComputedStyle(element).scrollMarginTop) || 0);

  const align = () => {
    if (Math.abs(offsetFromTarget()) > 2) element.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  const stop = () => {
    window.clearTimeout(timer);
    observer?.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
  };

  const pin = () => {
    window.removeEventListener('scroll', onScroll);
    align();
    pinUntil = performance.now() + pinMs;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (performance.now() > pinUntil) stop();
        else align();
      });
      observer.observe(document.body);
    }
    timer = window.setTimeout(stop, pinMs);
  };

  function onScroll() {
    window.clearTimeout(timer);
    timer = window.setTimeout(pin, 160);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  timer = window.setTimeout(pin, 600);
}

/* ------------------------------------------------------------------ */
/* Sliding glass thumb (segmented control / pager)                     */
/* ------------------------------------------------------------------ */

/**
 * Positions `thumbRef` under the `[aria-current="page"]` child of `trackRef`.
 * Re-runs when `key` changes so the thumb slides with a spring.
 */
export function useSlidingThumb(trackRef, thumbRef, key) {
  useLayoutEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return undefined;

    const place = (allowScroll) => {
      const active = track.querySelector('[aria-current="page"]');
      if (!active || !active.offsetWidth) {
        thumb.dataset.visible = 'false';
        return;
      }
      thumb.style.setProperty('--x', `${active.offsetLeft}px`);
      thumb.style.setProperty('--w', `${active.offsetWidth}px`);
      thumb.dataset.visible = 'true';
      if (allowScroll && track.scrollWidth > track.clientWidth) {
        track.scrollTo({
          left: active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2,
          behavior: thumb.dataset.ready === 'true' ? 'smooth' : 'auto',
        });
      }
      if (thumb.dataset.ready !== 'true') {
        requestAnimationFrame(() => {
          thumb.dataset.ready = 'true';
        });
      }
    };

    place(true);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => place(false));
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackRef, thumbRef, key]);
}

/* ------------------------------------------------------------------ */
/* Media query                                                         */
/* ------------------------------------------------------------------ */

const DESKTOP_QUERY = '(min-width: 1024px)';

function subscribeDesktop(callback) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );
}
