import { apiFetch } from './apiClient.js'

function toEditorPost(apiPost) {
  return {
    id: apiPost.id,
    title: apiPost.title || '',
    slug: apiPost.slug || '',
    status: apiPost.status || 'draft',
    category: apiPost.category || '',
    tags: Array.isArray(apiPost.tags) ? apiPost.tags : [],
    excerpt: apiPost.excerpt || '',
    htmlBody: apiPost.contentMarkdown || '',
    thumbnailUrl: apiPost.thumbnail?.url || '',
    updatedAt: apiPost.updatedAt || null,
    publishedAt: apiPost.publishedAt || null,
  }
}

function toApiPayload(post) {
  const payload = {
    title: post.title,
    category: post.category,
    excerpt: post.excerpt || '',
    contentMarkdown: post.htmlBody || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
  }

  if (post.slug) {
    payload.slug = post.slug
  }

  if (typeof post.series === 'string') {
    payload.series = post.series || null
  }

  if (post.thumbnailUrl) {
    payload.thumbnail = {
      url: post.thumbnailUrl,
      alt: '',
      width: 0,
      height: 0,
      mimeType: 'image/webp',
      sizeBytes: 0,
    }
  }

  return payload
}

export function listPosts() {
  return apiFetch('/posts').then((data) => (Array.isArray(data?.items) ? data.items : []))
}

export function getPost(postId) {
  return apiFetch(`/posts/${postId}`).then(toEditorPost)
}

export function createPost(payload) {
  return apiFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
}

export function updatePost(postId, payload) {
  return apiFetch(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
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
