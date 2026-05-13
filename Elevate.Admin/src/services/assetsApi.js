import { apiFetch } from '../lib/apiClient.js'

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

export function requestAttachUploadSas(payload, options = {}) {
  return apiFetch('/files/sas', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerFile(payload, options = {}) {
  return apiFetch('/files', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
