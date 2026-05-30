export const POST_CARD_IMAGE_SIZES = '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw';

function getImageUrl(image) {
  if (typeof image === 'string') return image || null;
  return image?.signedUrl || image?.url || null;
}

function toPositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
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

export function getThumbnailImageProps(thumbnail, { sizes = POST_CARD_IMAGE_SIZES } = {}) {
  const variants = collectVariantCandidates(thumbnail);
  const fallbackSrc = getImageUrl(thumbnail);

  if (!variants.length && !fallbackSrc) return null;

  const largestVariant = variants.at(-1);
  const fallbackDimensions = {
    src: fallbackSrc,
    width: toPositiveNumber(thumbnail?.width) || largestVariant?.width,
    height: toPositiveNumber(thumbnail?.height) || largestVariant?.height,
  };
  const selected = fallbackSrc ? fallbackDimensions : largestVariant || fallbackDimensions;

  return {
    src: selected.src,
    srcSet: variants.length
      ? [
        ...variants,
        ...(fallbackSrc && fallbackDimensions.width
          && !variants.some((variant) => variant.src === fallbackSrc || variant.width >= fallbackDimensions.width)
          ? [fallbackDimensions]
          : []),
      ].map((variant) => `${variant.src} ${variant.width}w`).join(', ')
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
