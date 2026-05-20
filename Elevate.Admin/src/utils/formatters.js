/**
 * 날짜/시각 값을 한국어 형식으로 포맷한다.
 * 유효하지 않은 값은 '-'를 반환한다.
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/**
 * 문자열을 URL-safe 슬러그로 변환한다.
 * 소문자 + 영숫자 + 하이픈만 허용하며 한글·특수문자는 제거한다.
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * 다양한 YouTube URL 형식에서 11자리 동영상 ID를 추출한다.
 * 지원 패턴:
 *   - 일반 URL: youtube.com/watch?v=ID
 *   - 단축 URL: youtu.be/ID
 *   - Shorts:   youtube.com/shorts/ID
 *   - 임베드:   youtube.com/embed/ID
 * @param {string|null|undefined} url
 * @returns {string|null} 11자리 ID, 추출 실패 시 null
 */
export function extractYoutubeId(url) {
  if (!url) return null
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
