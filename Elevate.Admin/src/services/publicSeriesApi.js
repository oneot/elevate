import { API_BASE_URL } from '../lib/apiClient.js'

/** 관리자 API와 같은 Function App의 공개 API 주소 (…/api/admin → …/api/public). 형식이 다르면 쓰지 않는다. */
export const PUBLIC_API_BASE_URL = /\/admin$/.test(API_BASE_URL) ? API_BASE_URL.replace(/\/admin$/, '/public') : ''

/**
 * 공개 사이트에 게시된 시리즈 글의 순서 (post id → seriesOrder).
 * 공개 블로그는 게시일이 같은 글을 시리즈 순서로 정렬하는데, 관리자 목록 API 요약에는 seriesOrder가 없다.
 * 그래서 인증이 필요 없는 공개 API GET /series를 한 번 부른다 (서명 URL이 없는 작은 응답).
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<Map<string, number>>}
 */
export async function getPublishedSeriesOrder({ signal } = {}) {
  if (!PUBLIC_API_BASE_URL) return new Map()
  const response = await fetch(`${PUBLIC_API_BASE_URL}/series`, { signal })
  if (!response.ok) throw new Error(`PUBLIC_SERIES_${response.status}`)
  const data = await response.json()
  const orders = new Map()
  for (const series of Array.isArray(data?.items) ? data.items : []) {
    for (const post of Array.isArray(series?.posts) ? series.posts : []) {
      if (post?.id && Number.isFinite(post.seriesOrder)) orders.set(post.id, post.seriesOrder)
    }
  }
  return orders
}
