import { apiFetch } from './client'

/**
 * 공개 달력 이벤트 목록을 조회한다.
 * @param {{ signal? }} options
 * @returns {Promise<{items: Array}>}
 */
export function listCalendarEvents({ signal } = {}) {
  return apiFetch('/calendar-events', { signal })
}
