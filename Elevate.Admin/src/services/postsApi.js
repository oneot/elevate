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
    status: apiPost.status || 'archived',
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
 * 새 게시글 생성 페이로드. 관리자 화면은 제목·요약·본문·게시 상태만 다루며,
 * slug는 보내지 않아 서버가 제목에서 중복 없는 값을 만든다.
 * tags에는 앱 분류용 태그(예: Word → ['word'])만 담는다 (서버는 배열을 필수로 받는다).
 * thumbnail은 게시할 때 자동으로 만든 썸네일이 있을 때만 포함한다.
 * @param {{ title: string, category: string, excerpt?: string, htmlBody?: string, status: string, tags?: string[], thumbnail?: object }} post
 */
function toCreatePayload(post) {
  const payload = {
    title: post.title,
    category: post.category,
    excerpt: post.excerpt || '',
    contentMarkdown: post.htmlBody || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
  }
  if (post.thumbnail?.url) payload.thumbnail = stripThumbnailSignedUrls(post.thumbnail)
  return payload
}

/**
 * 기존 게시글 수정 페이로드. 화면에서 고칠 수 있는 제목·요약·본문·게시 상태만 보낸다.
 * 서버는 보내지 않은 category·slug·tags·series·youtube·thumbnail을 그대로 유지하므로
 * 앱 분류와 공개 주소, 기존 썸네일이 수정으로 바뀌지 않는다.
 * thumbnail은 썸네일이 없던 글을 게시하며 자동으로 만든 경우에만 포함한다.
 * @param {{ title: string, excerpt?: string, htmlBody?: string, status: string, thumbnail?: object }} post
 */
function toUpdatePayload(post) {
  const payload = {
    title: post.title,
    excerpt: post.excerpt || '',
    contentMarkdown: post.htmlBody || '',
    status: post.status,
  }
  if (post.thumbnail?.url) payload.thumbnail = stripThumbnailSignedUrls(post.thumbnail)
  return payload
}

export const _test = {
  toCreatePayload,
  toUpdatePayload,
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
 * @param {object} post toCreatePayload 입력
 * @param {{ msalInstance }} options
 */
export function createPost(post, options = {}) {
  return apiFetch('/posts', {
    ...options,
    method: 'POST',
    body: JSON.stringify(toCreatePayload(post)),
  }).then(toEditorPost)
}

/**
 * 게시글을 수정한다.
 * @param {string} postId
 * @param {object} post toUpdatePayload 입력
 * @param {{ msalInstance }} options
 */
export function updatePost(postId, post, options = {}) {
  return apiFetch(`/posts/${postId}`, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(toUpdatePayload(post)),
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
