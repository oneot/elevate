import { useState } from 'react'
import { isApiConfigured } from '../lib/apiClient.js'
import { requestUploadSas, registerAsset } from '../services/assetsApi.js'
import {
  imageBlobCacheControl,
  normalizeImageMimeType,
  uploadBlobWithSas,
  supportedImageMimeTypes,
} from '../utils/imageUpload.js'

/**
 * 게시글 편집기 본문 이미지 업로드 훅 (편집기 붙여넣기·끌어 놓기·버튼).
 * 썸네일은 관리자에서 올리지 않는다. 게시된 글의 썸네일은 GitHub Actions 'Post thumbnails'가 만든다.
 *
 * API 미구성 환경(isApiConfigured === false)에서는 본문 이미지를 로컬 ObjectURL로 미리 보여 준다.
 *
 * @param {{ msalInstance, postId }} params
 */
export function usePostUpload({ msalInstance, postId }) {
  const [pendingUploads, setPendingUploads] = useState(0)

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

  return { uploading: pendingUploads > 0, uploadHtmlImage }
}
