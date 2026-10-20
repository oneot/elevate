/**
 * @file posts.js
 * @description 게시글·태그·시리즈 관련 API 함수 모음.
 *
 * 모든 함수는 `apiFetch`를 통해 Azure Functions `/api/public/*` 엔드포인트를 호출한다.
 * 서버는 이미지 URL에 SAS 토큰이 포함된 `signedUrl`을 응답에 미리 주입하므로
 * 클라이언트에서 별도 프록시 없이 직접 이미지를 렌더링할 수 있다.
 */
import { apiFetch, ApiError } from './client';
import { getThumbnailUrl as resolveThumbnailUrl } from '../utils/postImages';

function requireItems(data) {
  if (!Array.isArray(data?.items)) {
    throw new ApiError('게시글 응답 형식이 올바르지 않습니다.', { code: 'InvalidResponse' });
  }
  return data;
}

/**
 * thumbnail 필드에서 이미지 URL을 추출한다.
 *
 * 서버 응답의 thumbnail은 문자열 URL 또는 `{ signedUrl, url }` 객체 두 형태로 올 수 있다.
 * signedUrl(SAS 토큰 포함)이 있으면 우선 사용한다.
 *
 * @param {string|{signedUrl?: string, url?: string}|null} thumbnail
 * @returns {string|null} 이미지 URL, 없으면 null
 */
export function getThumbnailUrl(thumbnail) {
  return resolveThumbnailUrl(thumbnail);
}

/**
 * 게시글 목록을 페이지 단위로 조회한다.
 *
 * 기본값(limit=20, page=1) 파라미터는 쿼리 문자열에서 생략하여 URL을 간결하게 유지한다.
 *
 * @param {Object} [options]
 * @param {number} [options.limit=20] - 페이지당 게시글 수
 * @param {number} [options.page=1] - 페이지 번호
 * @param {string} [options.category] - 단일 카테고리 필터 ('all' 은 무시됨)
 * @param {string[]} [options.categories] - 복수 카테고리 필터
 * @param {string} [options.tag] - 태그 필터
 * @param {string} [options.q] - 제목/요약/슬러그 검색어
 * @param {AbortSignal} [options.signal] - fetch 취소용 AbortSignal
 * @returns {Promise<{items: Array, totalPages: number, totalCount: number}>}
 */
export async function listPosts({ limit = 20, page = 1, category, categories, tag, q, signal } = {}) {
  const params = new URLSearchParams();
  if (limit !== 20) params.set('limit', String(limit));
  if (page !== 1) params.set('page', String(page));
  if (category && category !== 'all') params.set('category', category);
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  if (tag) params.set('tag', tag);
  if (q) params.set('q', q);
  const qs = params.toString();
  const data = requireItems(await apiFetch(`/posts${qs ? `?${qs}` : ''}`, { signal }));
  if (!Number.isInteger(data.totalPages) || data.totalPages < 0
    || !Number.isInteger(data.totalCount) || data.totalCount < 0) {
    throw new ApiError('게시글 페이지 정보가 올바르지 않습니다.', { code: 'InvalidResponse' });
  }
  return data;
}

export async function listAllPosts(options = {}) {
  const first = await listPosts({ ...options, limit: 100, page: 1 });
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const data = await listPosts({ ...options, limit: 100, page });
    items.push(...data.items);
  }
  return items;
}

/**
 * 특정 시리즈에 속하는 게시글 전체를 `seriesOrder` 순으로 조회한다.
 *
 * @param {string} seriesName - 시리즈 이름
 * @param {RequestInit} [options]
 * @returns {Promise<{items: Array}>}
 */
export async function listSeriesPosts(seriesName, options = {}) {
  return requireItems(await apiFetch(`/series/${encodeURIComponent(seriesName)}/posts`, options));
}

/**
 * 게시글 상세 데이터를 조회한다.
 *
 * 서버 응답에는 `contentMarkdown`(HTML 문자열), `signedUrl`(SAS 이미지 URL) 등이 포함된다.
 *
 * @param {string} category - 게시글 카테고리
 * @param {string} slug - 게시글 슬러그
 * @param {RequestInit} [options={}] - fetch 옵션 (signal 등)
 * @returns {Promise<Object>} 게시글 상세 객체
 */
export async function getPost(category, slug, options = {}) {
  const data = await apiFetch(`/posts/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`, options);
  if (!data || typeof data.slug !== 'string' || typeof data.category !== 'string'
    || typeof data.title !== 'string' || typeof data.contentMarkdown !== 'string') {
    throw new ApiError('게시글 응답 형식이 올바르지 않습니다.', { code: 'InvalidResponse' });
  }
  return data;
}

/**
 * 태그 목록을 조회한다.
 *
 * @param {Object} [options]
 * @param {string[]} [options.categories] - 특정 카테고리들의 태그만 조회
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{items: string[]}>}
 */
export async function listTags({ categories, signal } = {}) {
  const params = new URLSearchParams();
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  const qs = params.toString();
  return requireItems(await apiFetch(`/tags${qs ? `?${qs}` : ''}`, { signal }));
}

/**
 * Agenthon 카테고리의 가장 최근 게시글 상세 데이터를 조회한다.
 *
 * 목록 API는 썸네일 SAS URL이 없는 요약 정보만 반환하므로,
 * 목록에서 slug를 얻은 뒤 상세 API를 한 번 더 호출하는 2단계 순차 조회를 사용한다.
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<Object|null>} 최신 게시글 상세, 게시글이 없으면 null
 */
export async function getLatestAgenthonPost({ signal } = {}) {
  const data = await listPosts({ category: 'agenthon', limit: 1, page: 1, signal });
  const summary = data.items[0];
  if (!summary) return null;
  return getPost('agenthon', summary.slug, { signal });
}

/**
 * 특정 카테고리의 시리즈 목록을 조회한다.
 *
 * @param {string} [category] - 카테고리 이름 (미지정 시 전체 시리즈)
 * @param {AbortSignal} [signal] - fetch 취소용 AbortSignal
 * @returns {Promise<{items: Array}>}
 */
export async function listSeriesByCategory(category, signal) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  return requireItems(await apiFetch(`/series?${params.toString()}`, { signal }));
}
