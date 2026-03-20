import { isApiConfigured } from './apiClient.js'
import { apiFetch } from './apiClient.js'

/**
 * 포스트/블로그 트래픽 통계 Mock 데이터 (isApiConfigured === false)
 */
const MOCK_ANALYTICS_SUMMARY = {
  totalPv: 12450,
  totalUv: 8320,
  avgTimeOnPage: '2m 15s',
  dailyTrend: [
    { date: '02/21', pv: 420 },
    { date: '02/22', pv: 580 },
    { date: '02/23', pv: 712 },
    { date: '02/24', pv: 650 },
    { date: '02/25', pv: 890 },
    { date: '02/26', pv: 1120 },
    { date: '02/27', pv: 1540 },
  ],
  topPosts: [
    { title: 'Azure 기반 블로그 아키텍처', views: 3200, slug: 'azure-architecture-handoff' },
    { title: 'Copilot Studio 연계 방향', views: 2150, slug: 'copilot-studio-knowledge' },
    { title: 'Admin 운영 가이드 초안', views: 1800, slug: 'admin-operations-guide' },
  ]
}

/**
 * 대시보드 통계 요약 데이터를 가져옵니다.
 */
export async function getAnalyticsSummary(options = {}) {
  if (!isApiConfigured) {
    // API 연결 전 Mock 응답 반환 (딜레이 추가)
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ANALYTICS_SUMMARY), 600)
    })
  }

  return apiFetch('/analytics/summary', options)
}
