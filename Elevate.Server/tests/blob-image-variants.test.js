const test = require('node:test');
const assert = require('node:assert/strict');

const {
  downloadBlobBuffer,
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

test('downloadBlobBuffer does not expose signed URLs in errors', async (t) => {
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  global.fetch = async () => ({ ok: false, status: 403 });

  await assert.rejects(
    downloadBlobBuffer('https://acct.blob.core.windows.net/images/source.jpg?sig=secret-token'),
    (error) => {
      assert.equal(error.message, 'Download failed with status 403');
      assert.equal(error.message.includes('sig=secret-token'), false);
      return true;
    }
  );
});
