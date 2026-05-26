import { apiFetch } from '../lib/apiClient.js'

/**
 * 이미지 자산 업로드용 SAS URL을 발급받는다.
 * 반환된 uploadUrl 로 Azure Blob Storage에 직접 PUT 업로드한다.
 * @param {{ fileName: string, contentType: string, sizeBytes: number }} payload
 * @param {{ msalInstance }} options
 */
export function requestUploadSas(payload, options = {}) {
  return apiFetch('/assets/sas', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Blob 업로드가 완료된 이미지 자산을 서버에 등록한다.
 * 등록 후 CDN 서명 URL(signedUrl) 또는 원본 URL이 포함된 자산 객체를 반환한다.
 * @param {{ postId: string|null, blobUrl: string, contentType: string, sizeBytes: number, fileName: string }} payload
 * @param {{ msalInstance }} options
 */
export function registerAsset(payload, options = {}) {
  return apiFetch('/assets', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 첨부파일 업로드용 SAS URL을 발급받는다. 이미지(/assets/sas)와 엔드포인트가 분리되어 있다.
 * @param {{ fileName: string, contentType: string, sizeBytes: number }} payload
 * @param {{ msalInstance }} options
 */
export function requestAttachUploadSas(payload, options = {}) {
  return apiFetch('/files/sas', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Blob 업로드가 완료된 첨부파일을 서버에 등록한다.
 * @param {{ postId: string|null, blobUrl: string, fileName: string, contentType: string, sizeBytes: number }} payload
 * @param {{ msalInstance }} options
 */
export function registerFile(payload, options = {}) {
  return apiFetch('/files', {
    ...options,
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 게시글에 등록된 첨부파일 목록을 조회한다.
 * @param {string} postId
 * @param {{ msalInstance }} options
 * @returns {Promise<Array<{ id: string, fileName: string, blobUrl: string, signedUrl: string | null, contentType: string, sizeBytes: number }>>}
 */
export function getFiles(postId, options = {}) {
  return apiFetch(`/files?postId=${encodeURIComponent(postId)}`, {
    ...options,
    method: 'GET',
  })
}

/**
 * 첨부파일을 서버 DB와 Blob Storage에서 삭제한다.
 * @param {string} fileId
 * @param {{ msalInstance }} options
 * @returns {Promise<null>} 성공 시 null (204 No Content)
 */
export function deleteFile(fileId, options = {}) {
  return apiFetch(`/files/${encodeURIComponent(fileId)}`, {
    ...options,
    method: 'DELETE',
  })
}
