import { apiFetch } from '../lib/apiClient.js'
import { stripThumbnailSignedUrls } from '../utils/thumbnailPayload.js'

/**
 * API 응답 객체를 에디터에서 사용하는 형태로 변환한다.
 *
 * - contentMarkdown → htmlBody: 서버는 'contentMarkdown' 키를 사용하지만
 *   에디터 상태에서는 'htmlBody'로 통일한다.
 * - thumbnail: signedUrl(CDN 서명 URL)을 우선 사용하고 없으면 원본 url 사용.
 *   에디터에서는 단순 문자열로 관리하므로 객체를 평탄화한다.
 * @param {object} apiPost
 */
function toEditorPost(apiPost) {
  return {
    id: apiPost.id,
    title: apiPost.title || '',
    slug: apiPost.slug || '',
    status: apiPost.status || 'draft',
    category: apiPost.category || '',
    tags: Array.isArray(apiPost.tags) ? apiPost.tags : [],
    excerpt: apiPost.excerpt || '',
    htmlBody: apiPost.contentMarkdown || '',
    series: apiPost.series || '',
    seriesOrder: apiPost.seriesOrder ?? null,
    thumbnailUrl: apiPost.thumbnail?.signedUrl || apiPost.thumbnail?.url || '',
    thumbnail: apiPost.thumbnail || null,
    youtube: apiPost.youtube || '',
    updatedAt: apiPost.updatedAt || null,
    publishedAt: apiPost.publishedAt || null,
  }
}

/**
 * 에디터 상태를 API 요청 페이로드로 변환한다.
 *
 * - slug: 비어 있으면 서버가 자동 생성하므로 값이 있을 때만 포함한다.
 * - series: string 타입일 때만 포함하며, 빈 문자열은 null 로 전송해 시리즈를 해제한다.
 * - thumbnailUrl: 값이 있을 때만 thumbnail 객체를 구성한다.
 *   mimeType/sizeBytes 는 에디터 상태에서 원본 파일 정보가 없으므로 기본값을 사용한다.
 * - youtube: undefined 이면 전송하지 않는다. 빈 문자열은 null 로 전송해 연결을 해제한다.
 * @param {object} post 에디터 상태 객체
 */
function toApiPayload(post) {
  const normalizedSeries = typeof post.series === 'string' ? post.series.trim() : post.series
  const normalizedSeriesOrder = Number.isInteger(post.seriesOrder) && post.seriesOrder > 0
    ? post.seriesOrder
    : null

  const payload = {
    title: post.title,
    category: post.category,
    excerpt: post.excerpt || '',
    contentMarkdown: post.htmlBody || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
  }

  if (post.slug) {
    payload.slug = post.slug
  }

  if (typeof normalizedSeries === 'string') {
    payload.series = normalizedSeries || null
  }

  if (post.seriesOrder !== undefined) {
    payload.seriesOrder = normalizedSeries ? normalizedSeriesOrder : null
  }

  if (post.thumbnail?.url) {
    payload.thumbnail = stripThumbnailSignedUrls(post.thumbnail)
  } else if (post.thumbnailUrl) {
    payload.thumbnail = {
      url: post.thumbnailUrl,
      alt: '',
      width: 0,
      height: 0,
      mimeType: 'image/jpeg',
      sizeBytes: 0,
    }
  }

  if (post.youtube !== undefined) {
    payload.youtube = post.youtube || null
  }

  return payload
}

export const _test = {
  toApiPayload,
}

/**
 * 카테고리별 기존 시리즈 목록을 조회한다.
 * @param {string} category
 * @param {{ msalInstance?: object }} options
 */
export function listSeriesByCategory(category, options = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  const qs = params.toString()
  return apiFetch(`/series${qs ? `?${qs}` : ''}`, options)
}

/**
 * 게시글 목록을 조회한다. 쿼리 파라미터 기본값은 서버와 일치할 때 생략해
 * URL을 불필요하게 길어지지 않도록 한다.
 * @param {{ msalInstance, page?, limit?, status?, category?, search?, signal? }} options
 */
export function listPosts(options = {}) {
  const { msalInstance, page = 1, limit = 20, status, category, search, signal } = options;
  const params = new URLSearchParams();
  if (page !== 1) params.set('page', String(page));
  if (limit !== 20) params.set('limit', String(limit));
  if (status && status !== 'all') params.set('status', status);
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  const qs = params.toString();
  return apiFetch(`/posts${qs ? `?${qs}` : ''}`, { msalInstance, signal })
}

const LIST_ALL_PAGE_SIZE = 100

/**
 * 한 서버 category의 게시글 요약을 모든 상태·페이지에 걸쳐 조회한다 (서버 최대 limit 100).
 * 관리자 앱 목록은 공개 사이트와 같은 분류 규칙을 브라우저에서 적용하므로 category 전체가 필요하다.
 * @param {{ msalInstance, category: string, signal?: AbortSignal }} options
 * @returns {Promise<Array<object>>}
 */
export async function listAllPosts({ msalInstance, category, signal } = {}) {
  const first = await listPosts({ msalInstance, category, limit: LIST_ALL_PAGE_SIZE, signal })
  const items = Array.isArray(first?.items) ? [...first.items] : []
  const totalPages = Number.isInteger(first?.totalPages) ? first.totalPages : 1
  for (let page = 2; page <= totalPages; page += 1) {
    const data = await listPosts({ msalInstance, category, page, limit: LIST_ALL_PAGE_SIZE, signal })
    if (Array.isArray(data?.items)) items.push(...data.items)
  }
  return items
}

/**
 * 단일 게시글을 조회해 에디터 형태로 반환한다.
 * @param {string} postId
 * @param {{ msalInstance }} options
 */
export function getPost(postId, options = {}) {
  return apiFetch(`/posts/${postId}`, options).then(toEditorPost)
}

/**
 * 게시글을 생성한다.
 * @param {object} payload 에디터 상태 객체
 * @param {{ msalInstance }} options
 */
export function createPost(payload, options = {}) {
  return apiFetch('/posts', {
    ...options,
    method: 'POST',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
}

/**
 * 게시글을 수정한다.
 * @param {string} postId
 * @param {object} payload 에디터 상태 객체
 * @param {{ msalInstance }} options
 */
export function updatePost(postId, payload, options = {}) {
  return apiFetch(`/posts/${postId}`, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
}

/**
 * 게시글을 삭제한다. 성공 시 null 을 반환한다 (204 No Content).
 * @param {string} postId
 * @param {{ msalInstance }} options
 */
export function deletePost(postId, options = {}) {
  return apiFetch(`/posts/${postId}`, {
    ...options,
    method: 'DELETE',
  })
}
