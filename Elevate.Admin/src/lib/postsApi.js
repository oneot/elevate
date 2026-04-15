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
    thumbnailUrl: apiPost.thumbnail?.signedUrl || apiPost.thumbnail?.url || '',
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

export function listPosts(options = {}) {
  const { msalInstance, page = 1, limit = 20, status, category, search } = options;
  const params = new URLSearchParams();
  if (page !== 1) params.set('page', String(page));
  if (limit !== 20) params.set('limit', String(limit));
  if (status && status !== 'all') params.set('status', status);
  if (category && category !== 'all') params.set('category', category);
  if (search) params.set('search', search);
  const qs = params.toString();
  return apiFetch(`/posts${qs ? `?${qs}` : ''}`, { msalInstance })
}

export function getPost(postId, options = {}) {
  return apiFetch(`/posts/${postId}`, options).then(toEditorPost)
}

export function createPost(payload, options = {}) {
  return apiFetch('/posts', {
    ...options,
    method: 'POST',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
}

export function updatePost(postId, payload, options = {}) {
  return apiFetch(`/posts/${postId}`, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(toApiPayload(payload)),
  }).then(toEditorPost)
}

export function deletePost(postId, options = {}) {
  return apiFetch(`/posts/${postId}`, {
    ...options,
    method: 'DELETE',
  })
}

export function requestUploadSas(payload, options = {}) {
  return apiFetch('/assets/sas', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerAsset(payload, options = {}) {
  return apiFetch('/assets', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
