export function stripThumbnailSignedUrls(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'object') return thumbnail

  const { signedUrl, variants, ...rest } = thumbnail
  void signedUrl

  if (!variants || typeof variants !== 'object') {
    return rest
  }

  const cleanVariants = {}
  for (const [key, variant] of Object.entries(variants)) {
    if (!variant || typeof variant !== 'object') continue
    const { signedUrl: variantSignedUrl, ...cleanVariant } = variant
    void variantSignedUrl
    cleanVariants[key] = cleanVariant
  }

  return { ...rest, variants: cleanVariants }
}
