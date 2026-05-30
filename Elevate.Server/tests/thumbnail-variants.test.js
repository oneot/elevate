const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../src/controllers/postController');

test('normalizeThumbnail preserves valid image variants and legacy url', () => {
  const thumbnail = _test.normalizeThumbnail({
    url: 'https://example.com/original.jpg',
    signedUrl: 'https://example.com/signed-should-not-persist.jpg',
    width: 1600,
    height: 900,
    variants: {
      thumb: {
        url: 'https://example.com/thumb.webp',
        signedUrl: 'https://example.com/thumb-signed.webp',
        width: 480,
        height: 270,
        type: 'image/webp',
      },
      invalid: {
        signedUrl: 'https://example.com/no-url.webp',
        width: 320,
      },
    },
  });

  assert.deepEqual(thumbnail, {
    url: 'https://example.com/original.jpg',
    width: 1600,
    height: 900,
    variants: {
      thumb: {
        url: 'https://example.com/thumb.webp',
        width: 480,
        height: 270,
        type: 'image/webp',
      },
    },
  });
});

test('normalizeThumbnail keeps string thumbnails backward compatible', () => {
  assert.deepEqual(_test.normalizeThumbnail('https://example.com/original.jpg'), {
    url: 'https://example.com/original.jpg',
  });
});
