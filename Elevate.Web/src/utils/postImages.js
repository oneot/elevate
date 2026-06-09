export const POST_CARD_IMAGE_SIZES = '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw';
export const POST_CARD_MAX_VARIANT_WIDTH = 960;

function getImageUrl(image) {
  if (typeof image === 'string') return image || null;
  return image?.signedUrl || image?.url || null;
}

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function isAzureBlobImageUrl(url) {
  if (!url) return false;
  try {
    return new URL(url).hostname.endsWith('.blob.core.windows.net');
  } catch {
    return false;
  }
}

function collectVariantCandidates(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'object' || !thumbnail.variants) return [];
  return Object.values(thumbnail.variants)
    .map((variant) => ({
      src: getImageUrl(variant),
      width: toPositiveNumber(variant?.width),
      height: toPositiveNumber(variant?.height),
    }))
    .filter((variant) => variant.src && variant.width)
    .sort((a, b) => a.width - b.width);
}

export function getThumbnailImageProps(
  thumbnail,
  { sizes = POST_CARD_IMAGE_SIZES, maxVariantWidth = POST_CARD_MAX_VARIANT_WIDTH } = {}
) {
  const variants = collectVariantCandidates(thumbnail);
  const fallbackSrc = getImageUrl(thumbnail);

  if (!variants.length && !fallbackSrc) return null;
  if (!variants.length && typeof thumbnail === 'object' && isAzureBlobImageUrl(fallbackSrc)) return null;

  const displayVariants = variants.length
    ? variants.filter((variant) => !maxVariantWidth || variant.width <= maxVariantWidth)
    : [];
  const usableVariants = displayVariants.length ? displayVariants : variants.slice(0, 1);
  const largestVariant = usableVariants.at(-1);
  const fallbackDimensions = {
    src: fallbackSrc,
    width: toPositiveNumber(thumbnail?.width) || largestVariant?.width,
    height: toPositiveNumber(thumbnail?.height) || largestVariant?.height,
  };
  const selected = largestVariant || fallbackDimensions;

  return {
    src: selected.src,
    srcSet: usableVariants.length
      ? usableVariants.map((variant) => `${variant.src} ${variant.width}w`).join(', ')
      : undefined,
    sizes,
    width: selected.width,
    height: selected.height,
  };
}

export function getImageLoadingProps(priority = false) {
  return {
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
    fetchPriority: priority ? 'high' : 'auto',
  };
}

export function getThumbnailUrl(thumbnail) {
  return getImageUrl(thumbnail);
}
