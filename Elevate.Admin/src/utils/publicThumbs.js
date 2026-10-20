/**
 * 공개 사이트가 기존 글에 미리 만들어 둔 카드 썸네일('UI 미니어처', Elevate.Web/src/assets/post-thumbs).
 * 공개 카드는 이 이미지를 DB에 저장된 썸네일보다 먼저 쓴다 (Elevate.Web/src/utils/postThumbs.js).
 * 관리자 목록 카드와 편집 화면 미리보기도 같은 순서로 보여 준다. 이 이미지가 없는 게시된 글은 GitHub Actions
 * 'Post thumbnails'가 본문을 읽고 만들어 PR로 올린다 (tools/post-thumbs).
 * 이미지 파일은 화면에 보일 때만 내려받는다.
 */
// base로 키를 './<앱>/<slug>-<폭>.webp'로 줄여 목록 JS에 들어가는 주소표를 작게 유지한다.
const FILES = import.meta.glob('./*/*.webp', {
  base: '../../../Elevate.Web/src/assets/post-thumbs/',
  eager: true,
  import: 'default',
})

/** '<앱>/<slug>' → { 480: url, 960: url } */
const THUMBS = {}
for (const [path, url] of Object.entries(FILES)) {
  const match = /^\.\/([^/]+)\/(.+)-(480|960)\.webp$/.exec(path)
  if (!match) continue
  const [, app, slug, width] = match
  const key = `${app}/${slug}`
  THUMBS[key] = { ...THUMBS[key], [width]: url }
}

/**
 * 공개 사이트 카드와 같은 정적 썸네일 <img> 속성 (Elevate.Web getPostThumbImageProps와 같은 결과). 없으면 null.
 * @param {string} app 공개 사이트 표시 앱 (예: 'word')
 * @param {string} slug
 * @param {string} [sizes] <img sizes> 값
 * @returns {{ src: string, srcSet: string, sizes?: string, width: number, height: number } | null}
 */
export function getPublicThumbImageProps(app, slug, sizes) {
  const thumb = app && slug ? THUMBS[`${app}/${slug}`] : null
  if (!thumb?.[480] || !thumb?.[960]) return null
  return {
    src: thumb[960],
    srcSet: `${thumb[480]} 480w, ${thumb[960]} 960w`,
    sizes,
    width: 960,
    height: 540,
  }
}

/**
 * 편집 화면 미리보기용 정적 썸네일 주소. 없으면 null.
 * @returns {{ src: string, srcSet: string } | null}
 */
export function getPublicThumbImage(app, slug) {
  const props = getPublicThumbImageProps(app, slug)
  return props && { src: props.src, srcSet: props.srcSet }
}

/** 정적 썸네일이 있는 글 수 (테스트·점검용). */
export function countPublicThumbs() {
  return Object.values(THUMBS).filter((thumb) => thumb[480] && thumb[960]).length
}
