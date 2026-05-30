import { thumbnailVariantSpecs } from './imageUpload.js'

export function assertCompleteThumbnailVariants(variants) {
  const missingKeys = thumbnailVariantSpecs
    .map((spec) => spec.key)
    .filter((key) => !variants[key]?.url)

  if (missingKeys.length > 0) {
    throw new Error(`Missing thumbnail variants: ${missingKeys.join(', ')}`)
  }

  return variants
}
