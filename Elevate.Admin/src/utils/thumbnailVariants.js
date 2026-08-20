import { normalizeImageMimeType, thumbnailVariantSpecs } from './imageUpload.js'

const variantSourceMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export function canCreateThumbnailVariants(file) {
  const contentType = normalizeImageMimeType(file)
  return variantSourceMimeTypes.has(contentType)
    && typeof createImageBitmap === 'function'
    && typeof document !== 'undefined'
}

export function assertCompleteThumbnailVariants(variants) {
  const missingKeys = thumbnailVariantSpecs
    .map((spec) => spec.key)
    .filter((key) => !variants[key]?.url)

  if (missingKeys.length > 0) {
    throw new Error(`Missing thumbnail variants: ${missingKeys.join(', ')}`)
  }

  return variants
}
