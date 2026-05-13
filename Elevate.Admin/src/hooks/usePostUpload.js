import { useState } from 'react'
import { isApiConfigured } from '../lib/apiClient.js'
import { requestUploadSas, registerAsset } from '../services/assetsApi.js'
import { normalizeImageMimeType, uploadBlobWithSas, supportedImageMimeTypes } from '../utils/imageUpload.js'

export function usePostUpload({ msalInstance, postId, setPost, setError, setMessage }) {
  const [uploading, setUploading] = useState(false)

  const uploadThumbnail = async (selectedFile) => {
    if (!selectedFile) return

    const contentType = normalizeImageMimeType(selectedFile)
    if (!supportedImageMimeTypes.has(contentType)) {
      throw new Error('지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP, GIF, HEIC, HEIF, AVIF 파일만 업로드할 수 있습니다.')
    }

    if (!isApiConfigured) {
      const previewUrl = URL.createObjectURL(selectedFile)
      setPost((prev) => ({ ...prev, thumbnailUrl: previewUrl }))
      setMessage('API 없이 썸네일 미리보기 이미지를 적용했습니다.')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
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

  const uploadHtmlImage = async (selectedFile) => {
    const contentType = normalizeImageMimeType(selectedFile)
    if (!supportedImageMimeTypes.has(contentType)) {
      throw new Error('지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP, GIF, HEIC, HEIF, AVIF 파일만 업로드할 수 있습니다.')
    }

    if (!isApiConfigured) {
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
