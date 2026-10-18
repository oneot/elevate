import { apiFetch, ApiError } from './client'

/**
 * 공개 달력 이벤트 목록을 조회한다.
 * @param {{ signal?, start?, end?, limit? }} options
 * @returns {Promise<{items: Array}>}
 */
export async function listCalendarEvents({ signal, start, end, limit } = {}) {
  const params = new URLSearchParams()
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  const data = await apiFetch(`/calendar-events${qs ? `?${qs}` : ''}`, { signal })
  if (!Array.isArray(data?.items)) {
    throw new ApiError('일정 응답 형식이 올바르지 않습니다.', { code: 'InvalidResponse' })
  }
  return data
}
