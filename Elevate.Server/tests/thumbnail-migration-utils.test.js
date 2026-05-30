const test = require('node:test');
const assert = require('node:assert/strict');

const {
  requiredThumbnailVariantSpecs,
  isAzureBlobUrl,
  hasCompleteThumbnailVariants,
  buildVariantBlobPath,
  buildThumbnailVariantPatch,
  shouldMigrateThumbnail,
} = require('../src/utils/thumbnailVariants');

test('requiredThumbnailVariantSpecs matches web card needs', () => {
  assert.deepEqual(requiredThumbnailVariantSpecs, [
    { key: 'thumb', maxWidth: 480, type: 'image/webp', quality: 82 },
    { key: 'card', maxWidth: 960, type: 'image/webp', quality: 82 },
    { key: 'hero', maxWidth: 1440, type: 'image/webp', quality: 84 },
  ]);
});

test('isAzureBlobUrl accepts only Azure Blob URLs', () => {
  assert.equal(isAzureBlobUrl('https://acct.blob.core.windows.net/images/uploads/a.jpg'), true);
  assert.equal(isAzureBlobUrl('https://cdn.example.com/a.jpg'), false);
  assert.equal(isAzureBlobUrl('not a url'), false);
});

test('hasCompleteThumbnailVariants requires every configured variant with usable metadata', () => {
  assert.equal(hasCompleteThumbnailVariants({
    variants: {
      thumb: { url: 'https://example.com/thumb.webp', width: 480, height: 270, type: 'image/webp' },
      card: { url: 'https://example.com/card.webp', width: 960, height: 540, type: 'image/webp' },
      hero: { url: 'https://example.com/hero.webp', width: 1440, height: 810, type: 'image/webp' },
    },
  }), true);

  assert.equal(hasCompleteThumbnailVariants({
    variants: {
      thumb: { url: 'https://example.com/thumb.webp', width: 480, height: 270, type: 'image/webp' },
      card: { url: 'https://example.com/card.webp', width: 960, height: 540, type: 'image/webp' },
      hero: { url: 'https://example.com/hero.webp' },
    },
  }), false);
});

test('buildVariantBlobPath keeps upload month and appends variant key', () => {
  assert.equal(
    buildVariantBlobPath('https://acct.blob.core.windows.net/images/uploads/2026/04/source.jpg', 'card'),
    'uploads/2026/04/source-card.webp'
  );
});

test('buildThumbnailVariantPatch only updates thumbnail variant fields', () => {
  const patch = buildThumbnailVariantPatch({
    original: {
      url: 'https://acct.blob.core.windows.net/images/uploads/2026/04/source.jpg',
      width: 3200,
      height: 1800,
      mimeType: 'image/jpeg',
      sizeBytes: 5000000,
    },
    variants: {
      thumb: {
        url: 'https://acct.blob.core.windows.net/images/uploads/2026/04/source-thumb.webp',
        width: 480,
        height: 270,
        type: 'image/webp',
        sizeBytes: 20000,
      },
    },
  });

  assert.deepEqual(patch, [
    {
      op: 'set',
      path: '/thumbnail/variants',
      value: {
        thumb: {
          url: 'https://acct.blob.core.windows.net/images/uploads/2026/04/source-thumb.webp',
          width: 480,
          height: 270,
          type: 'image/webp',
          sizeBytes: 20000,
        },
      },
    },
  ]);
});

test('shouldMigrateThumbnail selects legacy Azure Blob thumbnails without complete variants', () => {
  assert.equal(shouldMigrateThumbnail({
    thumbnail: {
      url: 'https://acct.blob.core.windows.net/images/uploads/source.jpg',
    },
  }), true);
});

test('shouldMigrateThumbnail skips complete variants unless force is true', () => {
  const post = {
    thumbnail: {
      url: 'https://acct.blob.core.windows.net/images/uploads/source.jpg',
      variants: {
        thumb: { url: 'https://example.com/thumb.webp', width: 480, height: 270, type: 'image/webp' },
        card: { url: 'https://example.com/card.webp', width: 960, height: 540, type: 'image/webp' },
        hero: { url: 'https://example.com/hero.webp', width: 1440, height: 810, type: 'image/webp' },
      },
    },
  };

  assert.equal(shouldMigrateThumbnail(post), false);
  assert.equal(shouldMigrateThumbnail(post, { force: true }), true);
});

test('shouldMigrateThumbnail remigrates variants missing usable metadata', () => {
  assert.equal(shouldMigrateThumbnail({
    thumbnail: {
      url: 'https://acct.blob.core.windows.net/images/uploads/source.jpg',
      variants: {
        thumb: { url: 'https://example.com/thumb.webp' },
        card: { url: 'https://example.com/card.webp', width: 960, height: 540, type: 'image/webp' },
        hero: { url: 'https://example.com/hero.webp', width: 1440, height: 810, type: 'image/webp' },
      },
    },
  }), true);
});
