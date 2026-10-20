/**
 * 관리자 목록 순서. 공개 블로그(Elevate.Web/src/api/categoryPosts.js sortByPublishedDesc)와 같은 규칙이다:
 * 게시일 최신순 → 게시일이 같으면 시리즈 순서가 큰 글 먼저 → 서버 제목 역순.
 * 공개 사이트에 없는 아직 게시하지 않은 글은 마지막 수정 시각을 게시일 대신 쓴다.
 */
const titleCollator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' })

function toTime(value) {
  const time = Date.parse(value || '')
  return Number.isFinite(time) ? time : null
}

/** 정렬에 쓰는 시각: 게시일, 게시일이 없으면 마지막 수정 시각. */
export function getListTime(post) {
  return toTime(post?.publishedAt) ?? toTime(post?.updatedAt) ?? 0
}

export function sortByPublishedDesc(posts) {
  return [...posts].sort((a, b) => (
    getListTime(b) - getListTime(a)
    || (b.seriesOrder ?? -Infinity) - (a.seriesOrder ?? -Infinity)
    || titleCollator.compare(b.serverTitle || b.title || '', a.serverTitle || a.title || '')
  ))
}
