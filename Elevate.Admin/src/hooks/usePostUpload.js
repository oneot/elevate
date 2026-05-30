import { useEffect, useRef, useState } from 'react'
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
 * 게시글 편집기에서 썸네일 및 본문 이미지 업로드를 담당하는 훅.
 *
 * API 미구성 환경(isApiConfigured === false)에서는 Blob SAS 업로드 없이
 * URL.createObjectURL 로 로컬 미리보기만 제공하는 폴백 모드로 동작한다.
 *
 * @param {{ msalInstance, postId, setPost, setError, setMessage }} params
 */
export function usePostUpload({ msalInstance, postId, setPost, setError, setMessage }) {
  const [uploading, setUploading] = useState(false)
  const previewUrlRef = useRef(null)

  // 컴포넌트 언마운트 시 마지막으로 생성된 ObjectURL을 해제해 메모리 누수를 방지한다.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const uploadThumbnailVariants = async (selectedFile) => {
    if (!canCreateThumbnailVariants(selectedFile)) return {}

    try {
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
    } catch (error) {
      console.warn('[usePostUpload] thumbnail variants skipped', error)
      return {}
    }
  }

  /**
   * 썸네일 이미지를 업로드하고 postId에 연결한다.
   * 업로드 성공 시 setPost 를 통해 thumbnailUrl 을 갱신한다.
   * @param {File} selectedFile
   */
  const uploadThumbnail = async (selectedFile) => {
    if (!selectedFile) return

    const contentType = normalizeImageMimeType(selectedFile)
    if (!supportedImageMimeTypes.has(contentType)) {
      // throw 대신 setError로 전달해 상위 컴포넌트 catch 블록이 에러를 삼키지 않도록 한다.
      setError('지원하지 않는 이미지 형식입니다. JPG, PNG, WEBP, GIF, HEIC, HEIF, AVIF 파일만 업로드할 수 있습니다.')
      return
    }

    if (!isApiConfigured) {
      // API 서버가 없는 개발 환경에서는 로컬 ObjectURL로 미리보기만 제공한다.
      // 기존 ObjectURL이 있으면 먼저 해제해 메모리 누수를 방지한다.
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
      const previewUrl = URL.createObjectURL(selectedFile)
      previewUrlRef.current = previewUrl
      setPost((prev) => ({ ...prev, thumbnailUrl: previewUrl }))
      setMessage('API 없이 썸네일 미리보기 이미지를 적용했습니다.')
      return
    }

    setUploading(true)
    setError('')
    setMessage('')

    try {
      const uploadFile = await optimizeThumbnailForUpload(selectedFile)
      const uploadContentType = normalizeImageMimeType(uploadFile)

      // 1단계: SAS URL 발급
      const sas = await requestUploadSas({
        fileName: uploadFile.name,
        contentType: uploadContentType,
        sizeBytes: uploadFile.size,
      }, { msalInstance })

      // 2단계: Azure Blob Storage에 직접 업로드
      await uploadBlobWithSas(sas.uploadUrl, uploadFile, uploadContentType, {
        cacheControl: imageBlobCacheControl,
      })

      // 3단계: 서버에 자산 등록 — CDN 서명 URL 또는 원본 URL을 응답으로 받는다
      const asset = await registerAsset({
        postId: postId || null,
        blobUrl: sas.blobUrl,
        contentType: uploadContentType,
        sizeBytes: uploadFile.size,
        fileName: uploadFile.name,
      }, { msalInstance })

      const variants = await uploadThumbnailVariants(selectedFile)
      const thumbnail = {
        url: asset?.blobUrl || asset?.url || sas.blobUrl,
        signedUrl: asset?.signedUrl || null,
        alt: '',
        width: 0,
        height: 0,
        mimeType: uploadContentType,
        sizeBytes: uploadFile.size,
        ...(Object.keys(variants).length > 0 ? { variants } : {}),
      }

      // 응답에서 사용 가능한 URL을 우선순위대로 선택한다.
      setPost((prev) => ({
        ...prev,
        thumbnailUrl: thumbnail.signedUrl || thumbnail.url,
        thumbnail,
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
  }

  return { uploading, uploadThumbnail, uploadHtmlImage }
}
