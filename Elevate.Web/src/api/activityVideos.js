import { apiFetch } from './client';

export function listActivityVideos({ signal } = {}) {
  return apiFetch('/activity-videos', signal ? { signal } : undefined);
}
