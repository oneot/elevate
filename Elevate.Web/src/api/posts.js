import { apiFetch } from './client';

// thumbnail 객체 또는 URL 문자열에서 이미지 URL을 반환
// (서버가 SAS 포함 signedUrl을 미리 주입하므로 프록시 불필요)
export function getThumbnailUrl(thumbnail) {
  if (typeof thumbnail === 'string') return thumbnail || null;
  return thumbnail?.signedUrl || thumbnail?.url || null;
}

// 게시글 목록 (페이지 기반)
export function listPosts({ limit = 20, page = 1, category, categories, tag } = {}) {
  const params = new URLSearchParams();
  if (limit !== 20) params.set('limit', String(limit));
  if (page !== 1) params.set('page', String(page));
  if (category && category !== 'all') params.set('category', category);
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
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
export function listTags({ categories } = {}) {
  const params = new URLSearchParams();
  if (categories && categories.length > 0) params.set('categories', categories.join(','));
  const qs = params.toString();
  return apiFetch(`/tags${qs ? `?${qs}` : ''}`);
}

// Agenthon: 최신 published 게시글 1개 조회 (목록 → 상세 순차 조회)
export async function getLatestAgenthonPost() {
  const data = await listPosts({ category: 'agenthon', limit: 1, page: 1 });
  const summary = data?.items?.[0];
  if (!summary) return null;
  return getPost('agenthon', summary.slug);
}

// 카테고리별 시리즈 목록 (GET /api/public/series?category=)
export function listSeriesByCategory(category) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  return apiFetch(`/series?${params.toString()}`);
}
