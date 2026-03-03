import { apiFetch } from './apiClient.js'

export function listPosts() {
  return apiFetch('/posts')
}

export function getPost(postId) {
  return apiFetch(`/posts/${postId}`)
}

export function createPost(payload) {
  return apiFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePost(postId, payload) {
  return apiFetch(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, {
    method: 'DELETE',
  })
}

export function requestUploadSas(payload) {
  return apiFetch('/assets/sas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerAsset(payload) {
  return apiFetch('/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
