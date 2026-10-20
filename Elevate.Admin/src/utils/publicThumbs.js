/**
 * 공개 사이트가 기존 글에 미리 만들어 둔 카드 썸네일('UI 미니어처', Elevate.Web/src/assets/post-thumbs).
 * 공개 카드는 이 이미지를 DB에 저장된 썸네일보다 먼저 쓴다 (Elevate.Web/src/utils/postThumbs.js).
 * 관리자 편집 화면도 같은 순서로 미리보기를 보여 주고, 이 이미지가 있는 글에는 자동 썸네일을 만들지 않는다.
 * 이미지 파일은 미리보기에 쓸 때만 내려받는다.
 */
const FILES = import.meta.glob('../../../Elevate.Web/src/assets/post-thumbs/*/*.webp', { eager: true, import: 'default' })

/** '<앱>/<slug>' → { 480: url, 960: url } */
const THUMBS = {}
for (const [path, url] of Object.entries(FILES)) {
  const match = /post-thumbs\/([^/]+)\/(.+)-(480|960)\.webp$/.exec(path)
  if (!match) continue
  const [, app, slug, width] = match
  const key = `${app}/${slug}`
  THUMBS[key] = { ...THUMBS[key], [width]: url }
}

/**
 * 공개 사이트 정적 썸네일의 <img> 속성. 없으면 null.
 * @param {string} app 공개 사이트 표시 앱 (예: 'word')
 * @param {string} slug
 * @returns {{ src: string, srcSet: string } | null}
 */
export function getPublicThumbImage(app, slug) {
  const thumb = app && slug ? THUMBS[`${app}/${slug}`] : null
  if (!thumb?.[480] || !thumb?.[960]) return null
  return { src: thumb[960], srcSet: `${thumb[480]} 480w, ${thumb[960]} 960w` }
}

/** 정적 썸네일이 있는 글 수 (테스트·점검용). */
export function countPublicThumbs() {
  return Object.values(THUMBS).filter((thumb) => thumb[480] && thumb[960]).length
}
