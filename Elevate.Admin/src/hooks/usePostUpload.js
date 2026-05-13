import { useState } from 'react'
import { isApiConfigured } from '../lib/apiClient.js'
import { requestUploadSas, registerAsset } from '../services/assetsApi.js'
import { normalizeImageMimeType, uploadBlobWithSas, supportedImageMimeTypes } from '../utils/imageUpload.js'

/**
 * 게시글 편집기에서 썸네일 및 본문 이미지 업로드를 담당하는 훅.
 *
 * API 미구성 환경(isApiConfigured === false)에서는 Blob SAS 업로드 없이
 * URL.createObjectURL 로 로컬 미리보기만 제공하는 폴백 모드로 동작한다.
 *
 * @param {{ msalInstance, postId, setPost, setError, setMessage }} params
 */
export function usePostUpload({ msalInstance, postId, setPost, setError, setMessage }) {
  const [uploading, setUploading] = useState(false)

  /**
   * 썸네일 이미지를 업로드하고 postId에 연결한다.
   * 업로드 성공 시 setPost 를 통해 thumbnailUrl 을 갱신한다.
   * @param {File} selectedFile
   */
  const uploadThumbnail = async (selectedFile) => {
    if (!selectedFile) return

    const contentType = normalizeImageMimeType(selectedFile)
    if (!supportedImageMimeTypes.has(contentType)) {
      throw new Error('지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP, GIF, HEIC, HEIF, AVIF 파일만 업로드할 수 있습니다.')
    }

    if (!isApiConfigured) {
      // API 서버가 없는 개발 환경에서는 로컬 ObjectURL로 미리보기만 제공한다.
      const previewUrl = URL.createObjectURL(selectedFile)
      setPost((prev) => ({ ...prev, thumbnailUrl: previewUrl }))
      setMessage('API 없이 썸네일 미리보기 이미지를 적용했습니다.')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
      // 1단계: SAS URL 발급
      const sas = await requestUploadSas({
        fileName: selectedFile.name,
        contentType,
        sizeBytes: selectedFile.size,
      }, { msalInstance })

      // 2단계: Azure Blob Storage에 직접 업로드
      await uploadBlobWithSas(sas.uploadUrl, selectedFile, contentType)

      // 3단계: 서버에 자산 등록 — CDN 서명 URL 또는 원본 URL을 응답으로 받는다
      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType,
        sizeBytes: selectedFile.size,
        fileName: selectedFile.name,
      }, { msalInstance })

      // 응답에서 사용 가능한 URL을 우선순위대로 선택한다.
      setPost((prev) => ({
        ...prev,
        thumbnailUrl: asset?.signedUrl || asset?.url || asset?.cdnUrl || asset?.blobUrl || sas.blobUrl,
      }))
      setMessage('썸네일 이미지가 업로드되었습니다.')
    } catch (err) {
      setError(err.message || '썸네일 이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  /**
   * 에디터 본문에 삽입할 이미지를 업로드하고 URL을 반환한다.
   * HtmlEditor 의 onUploadImage 콜백으로 사용된다.
   * @param {File} selectedFile
   * @returns {Promise<string>} 삽입할 이미지 URL
   */
  const uploadHtmlImage = async (selectedFile) => {
    const contentType = normalizeImageMimeType(selectedFile)
    if (!supportedImageMimeTypes.has(contentType)) {
      throw new Error('지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP, GIF, HEIC, HEIF, AVIF 파일만 업로드할 수 있습니다.')
    }

    if (!isApiConfigured) {
      // API 미구성 시 로컬 ObjectURL 을 반환한다. 새로고침 후 URL이 무효화된다.
      return URL.createObjectURL(selectedFile)
    }

    const sas = await requestUploadSas({
      fileName: selectedFile.name,
      contentType,
      sizeBytes: selectedFile.size,
    }, { msalInstance })

    await uploadBlobWithSas(sas.uploadUrl, selectedFile, contentType)

    const asset = await registerAsset({
      postId: postId || null,
      blobUrl: sas.blobUrl,
      contentType,
      sizeBytes: selectedFile.size,
      fileName: selectedFile.name,
    }, { msalInstance })

    return asset?.signedUrl || asset?.url || asset?.cdnUrl || asset?.blobUrl || sas.blobUrl
  }

  return { uploading, uploadThumbnail, uploadHtmlImage }
}
