/**
 * @file postThumbs.js
 * @description 블로그 카드용 "UI 미니어처" 썸네일.
 *
 * 글마다 다루는 기능 화면을 크고 단순하게 다시 그려 미리 만들어 둔 이미지다
 * (src/assets/post-thumbs/<화면 카테고리>/<slug>-480.webp, -960.webp).
 * 관리자에 올린 썸네일은 그대로 두고 화면에서만 바꾸므로, 아직 이 이미지가 없는 새 글은
 * 지금처럼 관리자에서 올린 썸네일을 쓴다.
 */

const FILES = import.meta.glob('../assets/post-thumbs/*/*.webp', { eager: true, import: 'default' });

/** '<category>/<slug>' → { 480: url, 960: url } */
const THUMBS = {};
for (const [path, url] of Object.entries(FILES)) {
  const match = /post-thumbs\/([^/]+)\/(.+)-(480|960)\.webp$/.exec(path);
  if (!match) continue;
  const [, category, slug, width] = match;
  const key = `${category}/${slug}`;
  THUMBS[key] = { ...THUMBS[key], [width]: url };
}

/**
 * 게시글 주소(/<category>/<slug>)에 맞는 UI 미니어처 썸네일의 <img> 속성.
 *
 * @param {string} category - 화면 카테고리 (글 주소의 첫 부분)
 * @param {string} slug
 * @param {string} sizes - <img sizes> 값
 * @returns {{src: string, srcSet: string, sizes: string, width: number, height: number}|null}
 */
export function getPostThumbImageProps(category, slug, sizes) {
  const thumb = THUMBS[`${category}/${slug}`];
  if (!thumb?.[480] || !thumb?.[960]) return null;
  return {
    src: thumb[960],
    srcSet: `${thumb[480]} 480w, ${thumb[960]} 960w`,
    sizes,
    width: 960,
    height: 540,
  };
}

/** 썸네일이 있는 글 주소 목록 ('<category>/<slug>'). */
export function listPostThumbKeys() {
  return Object.keys(THUMBS).sort();
}
