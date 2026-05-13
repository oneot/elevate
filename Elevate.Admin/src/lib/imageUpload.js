const mimeTypeAliases = {
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/heic-sequence': 'image/heic',
  'image/heif-sequence': 'image/heif',
}

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

export const supportedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
])

export function normalizeImageMimeType(file) {
  const rawType = String(file?.type || '').trim().toLowerCase()
  const aliasedType = mimeTypeAliases[rawType] || rawType

  if (aliasedType) {
    return aliasedType
  }

  const fileName = String(file?.name || '')
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex < 0) {
    return ''
  }

  const extension = fileName.slice(dotIndex).toLowerCase()
  return extensionMimeMap[extension] || ''
}

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
