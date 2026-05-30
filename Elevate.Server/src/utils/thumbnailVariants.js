const path = require('path');

const requiredThumbnailVariantSpecs = [
  { key: 'thumb', maxWidth: 480, type: 'image/webp', quality: 82 },
  { key: 'card', maxWidth: 960, type: 'image/webp', quality: 82 },
  { key: 'hero', maxWidth: 1440, type: 'image/webp', quality: 84 },
];

function isAzureBlobUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    return new URL(url).hostname.endsWith('.blob.core.windows.net');
  } catch {
    return false;
  }
}

function hasCompleteThumbnailVariants(thumbnail) {
  const variants = thumbnail?.variants;
  if (!variants || typeof variants !== 'object') return false;
  return requiredThumbnailVariantSpecs.every((spec) => typeof variants[spec.key]?.url === 'string');
}

function buildVariantBlobPath(sourceUrl, variantKey) {
  const parsed = new URL(sourceUrl);
  const parts = parsed.pathname.split('/').filter(Boolean);
  const blobName = parts.slice(1).join('/');
  const extension = path.extname(blobName);
  const base = extension ? blobName.slice(0, -extension.length) : blobName;
  return `${base}-${variantKey}.webp`;
}

function buildThumbnailVariantPatch({ variants }) {
  return [
    {
      op: 'set',
      path: '/thumbnail/variants',
      value: variants,
    },
  ];
}

function shouldMigrateThumbnail(post, { force = false } = {}) {
  const thumbnail = post?.thumbnail;
  if (!thumbnail || typeof thumbnail !== 'object') return false;
  if (!isAzureBlobUrl(thumbnail.url)) return false;
  if (force) return true;
  return !hasCompleteThumbnailVariants(thumbnail);
}

module.exports = {
  requiredThumbnailVariantSpecs,
  isAzureBlobUrl,
  hasCompleteThumbnailVariants,
  buildVariantBlobPath,
  buildThumbnailVariantPatch,
  shouldMigrateThumbnail,
};
