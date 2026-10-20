// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { DocsPostCard } from '../src/components/elevate-docs/DocsList';
import { getPostThumbImageProps, listPostThumbKeys } from '../src/utils/postThumbs';

let root;
let host;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

async function renderCard(post) {
  await act(() => root.render(<MemoryRouter><DocsPostCard post={post} /></MemoryRouter>));
  return host.querySelector('.edoc-card__media img');
}

it('ships a 480w and 960w UI thumbnail for every listed post', () => {
  const keys = listPostThumbKeys();
  expect(keys.length).toBeGreaterThanOrEqual(80);
  for (const key of keys) {
    const [category, slug] = key.split('/');
    const props = getPostThumbImageProps(category, slug, '100vw');
    expect(props, key).not.toBeNull();
    expect(props.srcSet).toMatch(/-480\.webp 480w, .*-960\.webp 960w$/);
  }
});

it('uses the UI thumbnail on the card instead of the uploaded image', async () => {
  const img = await renderCard({
    id: 'p1', category: 'teams', slug: 'teams-speakerprogress', title: '발표자 진행으로 발표 실력 키우기',
    thumbnail: 'https://example.com/uploaded.jpg', publishedAt: '2026-03-11',
  });
  expect(img.getAttribute('src')).toMatch(/post-thumbs\/teams\/teams-speakerprogress-960\.webp$/);
  expect(img.getAttribute('srcset')).toContain('teams-speakerprogress-480.webp 480w');
});

it('keeps the uploaded thumbnail for posts without a UI thumbnail', async () => {
  const img = await renderCard({
    id: 'p2', category: 'teams', slug: 'brand-new-post', title: 'New',
    thumbnail: 'https://example.com/uploaded.jpg', publishedAt: '2026-10-19',
  });
  expect(img.getAttribute('src')).toBe('https://example.com/uploaded.jpg');
});
