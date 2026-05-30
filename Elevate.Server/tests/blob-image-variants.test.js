const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getResizedDimensions,
  getVariantContentSettings,
} = require('../src/services/blobImageVariants');

test('getResizedDimensions downscales wide images without upscaling', () => {
  assert.deepEqual(getResizedDimensions({ width: 3200, height: 1800, maxWidth: 960 }), {
    width: 960,
    height: 540,
  });
});

test('getResizedDimensions keeps smaller images at original size', () => {
  assert.deepEqual(getResizedDimensions({ width: 640, height: 360, maxWidth: 960 }), {
    width: 640,
    height: 360,
  });
});

test('getVariantContentSettings sets webp and cache headers', () => {
  assert.deepEqual(getVariantContentSettings(), {
    blobHTTPHeaders: {
      blobContentType: 'image/webp',
      blobCacheControl: 'private, max-age=2592000',
    },
  });
});
