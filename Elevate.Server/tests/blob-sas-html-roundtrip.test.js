const test = require('node:test');
const assert = require('node:assert/strict');

const BARE_ATTACH_URL =
  'https://stelvdevimiruajbu5bya.blob.core.windows.net/attachments/attach/2026/08/171a4e9f-53d1-4489-833e-0679327950e2.zip';
const BARE_IMAGE_URL =
  'https://stelvdevimiruajbu5bya.blob.core.windows.net/images/uploads/2026/08/2c3f6b18-0f4c-4f0e-9a1d-9a6d5f0f7e11.png';
const KOREAN_FILE_NAME = '맞춤법 탐정단.zip';
const QUOTED_FILE_NAME = "O'Reilly (final).pdf";

// 캐시를 교체하기 전에 실제 모듈에서 순수 함수를 캡처한다.
const { buildDownloadContentDisposition, toHtmlSafeSasToken } = require('../src/services/storageClient')._test;

// Azure SDK의 SASQueryParameters.toString()을 재현한다.
// 파라미터 순서는 @azure/storage-blob SASQueryParameters.js:235-262 기준이며,
// contentDisposition만 설정되므로 rscd가 마지막 파라미터가 된다.
function buildSdkStyleToken(disposition) {
  const parts = [
    ['sv', '2026-02-06'],
    ['sr', 'b'],
    ['sp', 'r'],
    ['sig', 'aB+/cd='],
  ];
  if (disposition) parts.push(['rscd', disposition]);
  return parts.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
}

// getBlobReadSasUrl의 조립 과정을 그대로 흉내낸다.
function signBlobUrl(blobUrl, options = {}) {
  const disposition = buildDownloadContentDisposition(options.downloadFileName);
  return `${blobUrl}?${toHtmlSafeSasToken(buildSdkStyleToken(disposition))}`;
}

function extractHref(html) {
  const match = html.match(/href="([^"]*)"/);
  return match ? match[1] : null;
}

function extractSrc(html) {
  const match = html.match(/src="([^"]*)"/);
  return match ? match[1] : null;
}

const mockContainer = {
  items: {
    query: () => ({ fetchAll: async () => ({ resources: [] }) }),
  },
};

const cosmosClientPath = require.resolve('../src/services/cosmosClient');
const storageClientPath = require.resolve('../src/services/storageClient');
const adminControllerPath = require.resolve('../src/controllers/adminController');
const postControllerPath = require.resolve('../src/controllers/postController');

require.cache[cosmosClientPath] = {
  id: cosmosClientPath,
  filename: cosmosClientPath,
  loaded: true,
  exports: {
    getPostsContainer: () => mockContainer,
    getAssetsContainer: () => mockContainer,
  },
};

require.cache[storageClientPath] = {
  id: storageClientPath,
  filename: storageClientPath,
  loaded: true,
  exports: {
    issueBlobUploadSas: async () => ({}),
    issueBlobAttachSas: async () => ({}),
    deleteBlobByUrl: async () => {},
    getBlobReadSasUrl: async (blobUrl, validHours, options = {}) => signBlobUrl(blobUrl, options),
  },
};

delete require.cache[adminControllerPath];
delete require.cache[postControllerPath];
const admin = require('../src/controllers/adminController');
const post = require('../src/controllers/postController');

test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[storageClientPath];
  delete require.cache[adminControllerPath];
  delete require.cache[postControllerPath];
});

test('saving a pasted attachment sas url stores only the bare blob url', () => {
  const signed = signBlobUrl(BARE_ATTACH_URL, { downloadFileName: KOREAN_FILE_NAME });
  const pasted = `<p><a href="${signed}">${signed}</a></p>`;

  assert.equal(
    admin._test.stripBlobSasFromHtml(pasted),
    `<p><a href="${BARE_ATTACH_URL}">${BARE_ATTACH_URL}</a></p>`
  );
});

test('public read signs a content disposition that matches the value used for the signature', async () => {
  const signed = signBlobUrl(BARE_ATTACH_URL, { downloadFileName: KOREAN_FILE_NAME });
  const stored = admin._test.stripBlobSasFromHtml(`<p><a href="${signed}">${signed}</a></p>`);

  const enriched = await post._test.enrichContentWithAttachDisposition(
    stored,
    new Map([[BARE_ATTACH_URL, KOREAN_FILE_NAME]])
  );

  // Azure가 string-to-sign을 만들 때 사용하는 값과 서명 대상 값이 일치해야 한다.
  assert.equal(
    new URL(extractHref(enriched)).searchParams.get('rscd'),
    buildDownloadContentDisposition(KOREAN_FILE_NAME)
  );
});

test('public read survives file names containing apostrophes and parentheses', async () => {
  const signed = signBlobUrl(BARE_ATTACH_URL, { downloadFileName: QUOTED_FILE_NAME });
  const stored = admin._test.stripBlobSasFromHtml(`<p><a href="${signed}">${signed}</a></p>`);

  const enriched = await post._test.enrichContentWithAttachDisposition(
    stored,
    new Map([[BARE_ATTACH_URL, QUOTED_FILE_NAME]])
  );

  assert.equal(
    new URL(extractHref(enriched)).searchParams.get('rscd'),
    buildDownloadContentDisposition(QUOTED_FILE_NAME)
  );
});

test('admin enrich and strip round trips are stable', async () => {
  const stored = `<p><a href="${BARE_ATTACH_URL}">${BARE_ATTACH_URL}</a></p>`;

  const once = admin._test.stripBlobSasFromHtml(await admin._test.enrichHtmlWithSas(stored));
  const twice = admin._test.stripBlobSasFromHtml(await admin._test.enrichHtmlWithSas(once));

  assert.equal(once, stored);
  assert.equal(twice, stored);
});

test('already corrupted content is healed on the public read path', async () => {
  const corruptedTail = "''%25E1%2584%2586%25E1%2585%25A1%25E1%2586%25BD.zip";
  const stored = `<p><a href="${BARE_ATTACH_URL}${corruptedTail}">${BARE_ATTACH_URL}${corruptedTail}</a></p>`;

  const enriched = await post._test.enrichContentWithAttachDisposition(
    stored,
    new Map([[BARE_ATTACH_URL, KOREAN_FILE_NAME]])
  );

  assert.equal(
    new URL(extractHref(enriched)).searchParams.get('rscd'),
    buildDownloadContentDisposition(KOREAN_FILE_NAME)
  );
});

test('already corrupted content is healed when the admin editor saves it', () => {
  const corruptedTail = "''%25E1%2584%2586.zip";
  const stored = `<p><a href="${BARE_ATTACH_URL}${corruptedTail}">text</a></p>`;

  assert.equal(
    admin._test.stripBlobSasFromHtml(stored),
    `<p><a href="${BARE_ATTACH_URL}">text</a></p>`
  );
});

test('image blob urls keep working through the strip and enrich cycle', async () => {
  const signed = signBlobUrl(BARE_IMAGE_URL);
  const stored = admin._test.stripBlobSasFromHtml(`<p><img src="${signed}"></p>`);

  assert.equal(stored, `<p><img src="${BARE_IMAGE_URL}"></p>`);

  const enriched = await admin._test.enrichHtmlWithSas(stored);
  const enrichedSrc = new URL(extractSrc(enriched));
  assert.equal(enrichedSrc.origin + enrichedSrc.pathname, BARE_IMAGE_URL);
  assert.equal(enrichedSrc.searchParams.get('rscd'), null);
});

test('stripping a sas url from link text keeps the surrounding markup intact', () => {
  // autolink는 붙여넣은 URL을 링크 텍스트에도 복제한다. 정규식이 < > 를 제외하지 않으면
  // 텍스트 노드의 URL을 매치할 때 뒤따르는 닫는 태그까지 삼켜 본문 구조가 깨진다.
  const signed = signBlobUrl(BARE_ATTACH_URL, { downloadFileName: KOREAN_FILE_NAME });
  const pasted = `<p><a href="${signed}">${signed}</a></p><p>다음 문단</p>`;

  assert.equal(
    admin._test.stripBlobSasFromHtml(pasted),
    `<p><a href="${BARE_ATTACH_URL}">${BARE_ATTACH_URL}</a></p><p>다음 문단</p>`
  );
});

test('strip is a no-op for content without blob urls', () => {
  assert.equal(admin._test.stripBlobSasFromHtml('<p>본문에 링크가 없다</p>'), '<p>본문에 링크가 없다</p>');
  assert.equal(admin._test.stripBlobSasFromHtml(''), '');
  assert.equal(admin._test.stripBlobSasFromHtml(null), null);
});
