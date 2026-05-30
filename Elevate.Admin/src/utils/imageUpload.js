/**
 * 브라우저가 잘못 감지하거나 누락하는 MIME 타입을 정규 MIME 타입으로 매핑한다.
 * 예: 일부 브라우저는 JPEG를 'image/jpg'로 보고한다.
 */
const mimeTypeAliases = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/heic-sequence': 'image/heic',
  'image/heif-sequence': 'image/heif',
}

/**
 * file.type 이 비어 있거나 인식 불가능할 때의 확장자 기반 폴백 맵.
 * Office 문서 등 비표준 MIME 타입 파일을 처리하는 AttachUploader 와 달리
 * 여기서는 이미지 확장자만 정의한다.
 */
const extensionMimeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
}

/** 업로드를 허용하는 이미지 MIME 타입 집합. */
export const supportedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
])

export const thumbnailVariantSpecs = [
  { key: 'thumb', maxWidth: 480, type: 'image/webp', quality: 0.82 },
  { key: 'card', maxWidth: 960, type: 'image/webp', quality: 0.82 },
  { key: 'hero', maxWidth: 1440, type: 'image/webp', quality: 0.84 },
]

/**
 * 파일의 MIME 타입을 정규화한다.
 * 1차: mimeTypeAliases 로 브라우저 비표준 타입 교정
 * 2차: 여전히 빈 값이면 파일 확장자로 폴백
 * @param {File} file
 * @returns {string} 정규화된 MIME 타입, 알 수 없으면 빈 문자열
 */
export function normalizeImageMimeType(file) {
  const rawType = String(file?.type || '').trim().toLowerCase()
  const aliasedType = mimeTypeAliases[rawType] || rawType

  if (aliasedType) {
    return aliasedType
  }

  // file.type 이 완전히 비어 있는 경우 확장자로 폴백한다.
  const fileName = String(file?.name || '')
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex < 0) {
    return ''
  }

  const extension = fileName.slice(dotIndex).toLowerCase()
  return extensionMimeMap[extension] || ''
}

/**
 * SAS URL을 사용해 파일을 Azure Blob Storage에 직접 업로드한다.
 * Azure Block Blob에 필요한 'x-ms-blob-type' 헤더를 포함한다.
 * 업로드 실패 시 에러 본문을 포함한 에러를 던진다.
 * @param {string} uploadUrl SAS 서명이 포함된 업로드 URL
 * @param {File} file 업로드할 파일
 * @param {string} contentType 파일의 MIME 타입
 */
export async function uploadBlobWithSas(uploadUrl, file, contentType) {
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': contentType,
    },
    body: file,
  })

  if (uploadResponse.ok) {
    return
  }

  let errorDetail = ''
  try {
    errorDetail = (await uploadResponse.text()).trim()
  } catch {
    errorDetail = ''
  }

  throw new Error(errorDetail || `Blob upload failed (${uploadResponse.status})`)
}

export function buildVariantFileName(fileName, variantKey, extension = 'webp') {
  const safeName = String(fileName || 'thumbnail').replace(/[^\w.-]+/g, '-')
  const dotIndex = safeName.lastIndexOf('.')
  const baseName = dotIndex > 0 ? safeName.slice(0, dotIndex) : safeName
  return `${baseName}-${variantKey}.${extension}`
}

function canvasToBlob(canvas, type, quality) {
  if (typeof canvas.convertToBlob === 'function') {
    return canvas.convertToBlob({ type, quality })
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Image variant conversion failed'))
    }, type, quality)
  })
}

export async function createImageVariantBlob(file, spec) {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('createImageBitmap is not supported')
  }

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, spec.maxWidth / bitmap.width)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = typeof OffscreenCanvas === 'function'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas')

    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D context is not available')
    context.drawImage(bitmap, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, spec.type, spec.quality)
    return { blob, width, height, type: blob.type || spec.type }
  } finally {
    if (typeof bitmap.close === 'function') bitmap.close()
  }
}
