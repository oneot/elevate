import { apiFetch } from '../lib/apiClient.js'

/**
 * 달력 이벤트 목록을 조회한다.
 * @param {{ msalInstance, linkedPostId? }} options
 */
export function listCalendarEvents({ msalInstance, linkedPostId } = {}) {
  const params = new URLSearchParams()
  if (linkedPostId) params.set('linkedPostId', linkedPostId)
  const qs = params.toString()
  return apiFetch(`/calendar-events${qs ? `?${qs}` : ''}`, { msalInstance })
}

/**
 * 단일 달력 이벤트를 조회한다.
 * @param {string} eventId
 * @param {{ msalInstance }} options
 */
export function getCalendarEvent(eventId, { msalInstance } = {}) {
  return apiFetch(`/calendar-events/${eventId}`, { msalInstance })
}

/**
 * 달력 이벤트를 생성한다.
 * @param {{ title, eventDates, eventLocation, eventTarget, linkedPostId }} payload
 * @param {{ msalInstance }} options
 */
export function createCalendarEvent(payload, { msalInstance } = {}) {
  return apiFetch('/calendar-events', {
    msalInstance,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 달력 이벤트를 수정한다. linkedPostId 연결/해제도 이 함수로 처리한다.
 * @param {string} eventId
 * @param {object} payload
 * @param {{ msalInstance }} options
 */
export function updateCalendarEvent(eventId, payload, { msalInstance } = {}) {
  return apiFetch(`/calendar-events/${eventId}`, {
    msalInstance,
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * 달력 이벤트를 삭제한다.
 * @param {string} eventId
 * @param {{ msalInstance }} options
 */
export function deleteCalendarEvent(eventId, { msalInstance } = {}) {
  return apiFetch(`/calendar-events/${eventId}`, {
    msalInstance,
    method: 'DELETE',
  })
}
