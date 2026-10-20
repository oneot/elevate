import { useState } from 'react'
import { isApiConfigured } from '../lib/apiClient.js'
import { requestUploadSas, registerAsset } from '../services/assetsApi.js'
import {
  buildVariantFileName,
  createImageVariantBlob,
  imageBlobCacheControl,
  normalizeImageMimeType,
  optimizeThumbnailForUpload,
  thumbnailVariantSpecs,
  uploadBlobWithSas,
  supportedImageMimeTypes,
} from '../utils/imageUpload.js'
import { assertCompleteThumbnailVariants, canCreateThumbnailVariants } from '../utils/thumbnailVariants.js'

/**
 * 게시글 편집기의 이미지 업로드를 담당하는 훅.
 * - uploadHtmlImage: 본문에 넣을 이미지를 올리고 URL을 돌려준다 (편집기 붙여넣기·끌어 놓기·버튼).
 * - uploadThumbnailFile: 게시할 때 자동으로 만든 썸네일 파일을 올리고 저장용 thumbnail 객체를 돌려준다.
 *   공개 사이트 카드는 480·960·1440 variants가 있어야 썸네일을 표시하므로 모두 만들어 올린다.
 *
 * API 미구성 환경(isApiConfigured === false)에서는 본문 이미지만 로컬 ObjectURL로 미리 보여 준다.
 *
 * @param {{ msalInstance, postId }} params
 */
export function usePostUpload({ msalInstance, postId }) {
  const [pendingUploads, setPendingUploads] = useState(0)

  const uploadThumbnailVariants = async (selectedFile) => {
    if (!canCreateThumbnailVariants(selectedFile)) {
      throw new Error('이 브라우저에서는 썸네일 크기별 이미지를 만들 수 없습니다.')
    }

    const entries = await Promise.all(thumbnailVariantSpecs.map(async (spec) => {
      const variant = await createImageVariantBlob(selectedFile, spec)
      const fileName = buildVariantFileName(selectedFile.name, spec.key)
      const sas = await requestUploadSas({
        fileName,
        contentType: variant.type,
        sizeBytes: variant.blob.size,
      }, { msalInstance })

      await uploadBlobWithSas(sas.uploadUrl, variant.blob, variant.type, {
        cacheControl: imageBlobCacheControl,
      })

      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType: variant.type,
        sizeBytes: variant.blob.size,
        fileName,
      }, { msalInstance })

      return [spec.key, {
        url: asset?.blobUrl || asset?.url || sas.blobUrl,
        signedUrl: asset?.signedUrl || null,
        width: variant.width,
        height: variant.height,
        type: variant.type,
        sizeBytes: variant.blob.size,
      }]
    }))
    return assertCompleteThumbnailVariants(Object.fromEntries(entries))
  }

  /**
   * 자동 생성한 썸네일 파일을 Blob Storage에 올리고 게시글에 저장할 thumbnail 객체를 돌려준다.
   * 원본(최대 640px)과 공개 카드용 variants를 모두 올려야 성공으로 본다.
   * @param {File} file
   * @param {{ width?: number, height?: number, alt?: string }} [details]
   * @returns {Promise<object>}
   */
  const uploadThumbnailFile = async (file, details = {}) => {
    const contentType = normalizeImageMimeType(file)
    if (!supportedImageMimeTypes.has(contentType)) {
      throw new Error('지원하지 않는 썸네일 이미지 형식입니다.')
    }

    setPendingUploads((count) => count + 1)
    try {
      const uploadFile = await optimizeThumbnailForUpload(file)
      const uploadContentType = normalizeImageMimeType(uploadFile)
      const sas = await requestUploadSas({
        fileName: uploadFile.name,
        contentType: uploadContentType,
        sizeBytes: uploadFile.size,
      }, { msalInstance })

      await uploadBlobWithSas(sas.uploadUrl, uploadFile, uploadContentType, {
        cacheControl: imageBlobCacheControl,
      })

      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType: uploadContentType,
        sizeBytes: uploadFile.size,
        fileName: uploadFile.name,
      }, { msalInstance })

      const variants = await uploadThumbnailVariants(file)
      return {
        url: asset?.blobUrl || asset?.url || sas.blobUrl,
        signedUrl: asset?.signedUrl || null,
        alt: details.alt || '',
        width: details.width || 0,
        height: details.height || 0,
        mimeType: uploadContentType,
        sizeBytes: uploadFile.size,
        variants,
      }
    } finally {
      setPendingUploads((count) => count - 1)
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

    setPendingUploads((count) => count + 1)
    try {
      const sas = await requestUploadSas({
        fileName: selectedFile.name,
        contentType,
        sizeBytes: selectedFile.size,
      }, { msalInstance })

      await uploadBlobWithSas(sas.uploadUrl, selectedFile, contentType, {
        cacheControl: imageBlobCacheControl,
      })

      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType,
        sizeBytes: selectedFile.size,
        fileName: selectedFile.name,
      }, { msalInstance })

      return asset?.signedUrl || asset?.url || asset?.cdnUrl || asset?.blobUrl || sas.blobUrl
    } finally {
      setPendingUploads((count) => count - 1)
    }
  }

  return { uploading: pendingUploads > 0, uploadThumbnailFile, uploadHtmlImage }
}
