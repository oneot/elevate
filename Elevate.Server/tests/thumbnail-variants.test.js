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

test('buildAttachmentFileNameByBlobUrlMap maps blob url to original file name', () => {
  const map = _test.buildAttachmentFileNameByBlobUrlMap([
    {
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/a.docx',
      fileName: '회의자료.docx',
    },
    {
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/b.pdf',
      fileName: '  ',
    },
  ]);

  assert.equal(
    map.get('https://account.blob.core.windows.net/attachments/attach/2026/06/a.docx'),
    '회의자료.docx'
  );
  assert.equal(
    map.has('https://account.blob.core.windows.net/attachments/attach/2026/06/b.pdf'),
    false
  );
});

test('hasAttachmentBlobUrlReference detects only attachment blob urls', () => {
  assert.equal(_test.hasAttachmentBlobUrlReference('plain text only'), false);
  assert.equal(_test.hasAttachmentBlobUrlReference('![image](https://account.blob.core.windows.net/images/a.jpg)'), false);
  assert.equal(_test.hasAttachmentBlobUrlReference('![file](https://account.blob.core.windows.net/attachments/attach/2026/06/a.pdf)'), true);
});
