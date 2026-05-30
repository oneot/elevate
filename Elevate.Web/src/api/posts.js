/**
 * @file posts.js
 * @description 게시글·태그·시리즈 관련 API 함수 모음.
 *
 * 모든 함수는 `apiFetch`를 통해 Azure Functions `/api/public/*` 엔드포인트를 호출한다.
 * 서버는 이미지 URL에 SAS 토큰이 포함된 `signedUrl`을 응답에 미리 주입하므로
 * 클라이언트에서 별도 프록시 없이 직접 이미지를 렌더링할 수 있다.
 */
import { apiFetch } from './client';
import { getThumbnailUrl as resolveThumbnailUrl } from '../utils/postImages';

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
export function listPosts({ limit = 20, page = 1, category, categories, tag, q, signal } = {}) {
  const params = new URLSearchParams();
  if (limit !== 20) params.set('limit', String(limit));
  if (page !== 1) params.set('page', String(page));
  if (category && category !== 'all') params.set('category', category);
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  if (tag) params.set('tag', tag);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiFetch(`/posts${qs ? `?${qs}` : ''}`, signal ? { signal } : undefined);
}

/**
 * 특정 시리즈에 속하는 게시글 전체를 `seriesOrder` 순으로 조회한다.
 *
 * @param {string} seriesName - 시리즈 이름
 * @returns {Promise<{items: Array}>}
 */
export function listSeriesPosts(seriesName) {
  return apiFetch(`/series/${encodeURIComponent(seriesName)}/posts`);
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
export function getPost(category, slug, options = {}) {
  return apiFetch(`/posts/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`, options);
}

/**
 * 태그 목록을 조회한다.
 *
 * @param {Object} [options]
 * @param {string[]} [options.categories] - 특정 카테고리들의 태그만 조회
 * @returns {Promise<{items: string[]}>}
 */
export function listTags({ categories } = {}) {
  const params = new URLSearchParams();
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  const qs = params.toString();
  return apiFetch(`/tags${qs ? `?${qs}` : ''}`);
}

/**
 * Agenthon 카테고리의 가장 최근 게시글 상세 데이터를 조회한다.
 *
 * 목록 API는 썸네일 SAS URL이 없는 요약 정보만 반환하므로,
 * 목록에서 slug를 얻은 뒤 상세 API를 한 번 더 호출하는 2단계 순차 조회를 사용한다.
 *
 * @returns {Promise<Object|null>} 최신 게시글 상세, 게시글이 없으면 null
 */
export async function getLatestAgenthonPost() {
  const data = await listPosts({ category: 'agenthon', limit: 1, page: 1 });
  const summary = data?.items?.[0];
  if (!summary) return null;
  return getPost('agenthon', summary.slug);
}

/**
 * 특정 카테고리의 시리즈 목록을 조회한다.
 *
 * @param {string} [category] - 카테고리 이름 (미지정 시 전체 시리즈)
 * @param {AbortSignal} [signal] - fetch 취소용 AbortSignal
 * @returns {Promise<{items: Array}>}
 */
export function listSeriesByCategory(category, signal) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  return apiFetch(`/series?${params.toString()}`, signal ? { signal } : undefined);
}
