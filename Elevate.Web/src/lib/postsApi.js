import { apiFetch, API_BASE } from './apiClient';

const BLOB_URL_PATTERN = /https:\/\/[a-z0-9]+\.blob\.core\.windows\.net\/[^/]+\/(uploads\/.+)/;

// thumbnail URL을 이미지 프록시 URL로 변환
export function getThumbnailUrl(thumbnail) {
  const raw = typeof thumbnail === 'string' ? thumbnail : thumbnail?.url;
  if (!raw) return null;
  const match = raw.match(BLOB_URL_PATTERN);
  if (match) return `${API_BASE}/image?path=${encodeURIComponent(match[1])}`;
  return raw;
}

// 게시글 목록 (페이지 기반)
export function listPosts({ limit = 20, page = 1, category, tag } = {}) {
  const params = new URLSearchParams();
  if (limit !== 20) params.set('limit', String(limit));
  if (page !== 1) params.set('page', String(page));
  if (category && category !== 'all') params.set('category', category);
  if (tag) params.set('tag', tag);
  const qs = params.toString();
  return apiFetch(`/posts${qs ? `?${qs}` : ''}`);
}

// 시리즈 게시글 전체 조회 (seriesOrder 순)
export function listSeriesPosts(seriesName) {
  return apiFetch(`/series/${encodeURIComponent(seriesName)}/posts`);
}

// 게시글 상세
export function getPost(category, slug) {
  return apiFetch(`/posts/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`);
}

// 태그 목록
export function listTags() {
  return apiFetch('/tags');
}

// 카테고리별 시리즈 목록 (GET /api/public/series?category=)
export function listSeriesByCategory(category) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  return apiFetch(`/series?${params.toString()}`);
}
