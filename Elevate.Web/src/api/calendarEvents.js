import { apiFetch } from './client'

/**
 * 공개 달력 이벤트 목록을 조회한다.
 * @param {{ signal?, start?, end?, limit? }} options
 * @returns {Promise<{items: Array}>}
 */
export function listCalendarEvents({ signal, start, end, limit } = {}) {
  const params = new URLSearchParams()
  if (start) params.set('start', start)
  if (end) params.set('end', end)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiFetch(`/calendar-events${qs ? `?${qs}` : ''}`, { signal })
}
