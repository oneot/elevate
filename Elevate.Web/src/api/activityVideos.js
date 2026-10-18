import { apiFetch, ApiError } from './client';

export async function listActivityVideos({ signal } = {}) {
  const data = await apiFetch('/activity-videos', { signal });
  if (!Array.isArray(data?.items)) {
    throw new ApiError('영상 목록 응답 형식이 올바르지 않습니다.', { code: 'InvalidResponse' });
  }
  return data;
}
