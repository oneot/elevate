import { apiFetch } from '../lib/apiClient.js'

export function listActivityVideos({ msalInstance, status, limit } = {}) {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return apiFetch(`/activity-videos${qs ? `?${qs}` : ''}`, { msalInstance })
}

export function getActivityVideo(activityVideoId, { msalInstance } = {}) {
  return apiFetch(`/activity-videos/${activityVideoId}`, { msalInstance })
}

export function createActivityVideo(payload, { msalInstance } = {}) {
  return apiFetch('/activity-videos', {
    msalInstance,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateActivityVideo(activityVideoId, payload, { msalInstance } = {}) {
  return apiFetch(`/activity-videos/${activityVideoId}`, {
    msalInstance,
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteActivityVideo(activityVideoId, { msalInstance } = {}) {
  return apiFetch(`/activity-videos/${activityVideoId}`, {
    msalInstance,
    method: 'DELETE',
  })
}
