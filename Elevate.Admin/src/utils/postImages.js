/**
 * 공개 사이트 게시글 카드의 이미지 규칙 (Elevate.Web/src/utils/postImages.js와 DocsList.jsx 복제).
 * 관리자 목록 카드가 공개 카드와 같은 이미지·같은 크기 후보를 쓰도록 그대로 옮겼다.
 * Web 원본과 결과가 같아야 한다 (tests/post-card-images.test.js).
 */

/** 공개 블로그 카드 그리드의 <img sizes> (Elevate.Web DocsList.jsx CARD_IMAGE_SIZES). */
export const CARD_IMAGE_SIZES = '(min-width: 1440px) 340px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw'

export const POST_CARD_IMAGE_SIZES = '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw'
export const POST_CARD_MAX_VARIANT_WIDTH = 960

function getImageUrl(image) {
  if (typeof image === 'string') return image || null
  return image?.signedUrl || image?.url || null
}

function toPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function isAzureBlobImageUrl(url) {
  if (!url) return false
  try {
    return new URL(url).hostname.endsWith('.blob.core.windows.net')
  } catch {
    return false
  }
}

function collectVariantCandidates(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'object' || !thumbnail.variants) return []
  return Object.values(thumbnail.variants)
    .map((variant) => ({
      src: getImageUrl(variant),
      width: toPositiveNumber(variant?.width),
      height: toPositiveNumber(variant?.height),
    }))
    .filter((variant) => variant.src && variant.width)
    .sort((a, b) => a.width - b.width)
}

/**
 * DB 썸네일(관리자에서 올린 썸네일)의 <img> 속성. variants가 없는 Blob 원본만 있으면 null.
 * @returns {{ src: string, srcSet?: string, sizes: string, width?: number, height?: number } | null}
 */
export function getThumbnailImageProps(
  thumbnail,
  { sizes = POST_CARD_IMAGE_SIZES, maxVariantWidth = POST_CARD_MAX_VARIANT_WIDTH } = {},
) {
  const variants = collectVariantCandidates(thumbnail)
  const fallbackSrc = getImageUrl(thumbnail)

  if (!variants.length && !fallbackSrc) return null
  if (!variants.length && typeof thumbnail === 'object' && isAzureBlobImageUrl(fallbackSrc)) return null

  const displayVariants = variants.length
    ? variants.filter((variant) => !maxVariantWidth || variant.width <= maxVariantWidth)
    : []
  const usableVariants = displayVariants.length ? displayVariants : variants.slice(0, 1)
  const largestVariant = usableVariants.at(-1)
  const fallbackDimensions = {
    src: fallbackSrc,
    width: toPositiveNumber(thumbnail?.width) || largestVariant?.width,
    height: toPositiveNumber(thumbnail?.height) || largestVariant?.height,
  }
  const selected = largestVariant || fallbackDimensions

  return {
    src: selected.src,
    srcSet: usableVariants.length
      ? usableVariants.map((variant) => `${variant.src} ${variant.width}w`).join(', ')
      : undefined,
    sizes,
    width: selected.width,
    height: selected.height,
  }
}

/** 첫 줄 카드(priority)는 바로, 나머지는 화면에 가까워질 때 불러온다. */
export function getImageLoadingProps(priority = false) {
  return {
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: priority ? 'high' : 'auto',
  }
}
