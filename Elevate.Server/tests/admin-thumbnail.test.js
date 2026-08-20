const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../src/controllers/adminController');

test('normalizeThumbnailForStorage whitelists supported thumbnail fields', () => {
  const thumbnail = _test.normalizeThumbnailForStorage({
    url: 'https://account.blob.core.windows.net/images/original.jpg?sig=secret',
    signedUrl: 'https://account.blob.core.windows.net/images/signed.jpg',
    alt: 'thumbnail',
    width: 1600,
    height: 900,
    mimeType: 'image/jpeg',
    sizeBytes: 1234,
    attackerControlled: true,
    variants: {
      thumb: {
        url: 'https://account.blob.core.windows.net/images/thumb.webp?sig=secret',
        signedUrl: 'https://account.blob.core.windows.net/images/thumb-signed.webp',
        width: 480,
        height: 270,
        type: 'image/webp',
        sizeBytes: 456,
        attackerControlled: true,
      },
    },
  });

  assert.deepEqual(thumbnail, {
    url: 'https://account.blob.core.windows.net/images/original.jpg',
    alt: 'thumbnail',
    width: 1600,
    height: 900,
    mimeType: 'image/jpeg',
    sizeBytes: 1234,
    variants: {
      thumb: {
        url: 'https://account.blob.core.windows.net/images/thumb.webp',
        width: 480,
        height: 270,
        type: 'image/webp',
        sizeBytes: 456,
      },
    },
  });
});

test('collectThumbnailUrls deduplicates original and variant URLs', () => {
  const urls = _test.collectThumbnailUrls({
    url: 'https://example.com/original.jpg',
    variants: {
      duplicate: { url: 'https://example.com/original.jpg' },
      thumb: { url: 'https://example.com/thumb.webp' },
    },
  });

  assert.deepEqual(urls, [
    'https://example.com/original.jpg',
    'https://example.com/thumb.webp',
  ]);
});
