const test = require('node:test');
const assert = require('node:assert/strict');

const {
  stripOrphanBlobUrlTails,
  countOrphanBlobUrlTails,
  hasOrphanBlobUrlTail,
  firstOrphanBlobUrlTail,
  shouldRepairPostContent,
  buildContentRepairPatch,
} = require('../src/utils/blobUrlHtml');

const ATTACH_URL =
  'https://stelvdevimiruajbu5bya.blob.core.windows.net/attachments/attach/2026/08/171a4e9f-53d1-4489-833e-0679327950e2.zip';
const IMAGE_URL =
  'https://stelvdevimiruajbu5bya.blob.core.windows.net/images/uploads/2026/08/2c3f6b18-0f4c-4f0e-9a1d-9a6d5f0f7e11.png';
const TAIL = "''%25E1%2584%2586%25E1%2585%25A1%25E1%2586%25BD.zip";

test('stripOrphanBlobUrlTails removes the tail from both the href and the link text', () => {
  const corrupted = `<p><a href="${ATTACH_URL}${TAIL}">${ATTACH_URL}${TAIL}</a></p>`;

  assert.equal(
    stripOrphanBlobUrlTails(corrupted),
    `<p><a href="${ATTACH_URL}">${ATTACH_URL}</a></p>`
  );
});

test('stripOrphanBlobUrlTails collapses accumulated tails in a single pass', () => {
  const corrupted = `<a href="${ATTACH_URL}${TAIL}${TAIL}${TAIL}">x</a>`;

  assert.equal(stripOrphanBlobUrlTails(corrupted), `<a href="${ATTACH_URL}">x</a>`);
});

test('stripOrphanBlobUrlTails is idempotent', () => {
  const corrupted = `<a href="${ATTACH_URL}${TAIL}">x</a>`;
  const once = stripOrphanBlobUrlTails(corrupted);

  assert.equal(stripOrphanBlobUrlTails(once), once);
});

test('stripOrphanBlobUrlTails leaves clean content untouched', () => {
  const clean = `<p><a href="${ATTACH_URL}">첨부파일</a></p>`;

  assert.equal(stripOrphanBlobUrlTails(clean), clean);
});

test('stripOrphanBlobUrlTails leaves a possessive apostrophe in prose alone', () => {
  const prose = `<p>${ATTACH_URL}'s metadata</p>`;

  assert.equal(stripOrphanBlobUrlTails(prose), prose);
});

test('stripOrphanBlobUrlTails leaves single quoted attributes alone', () => {
  const singleQuoted = `<a href='${ATTACH_URL}'>x</a>`;

  assert.equal(stripOrphanBlobUrlTails(singleQuoted), singleQuoted);
});

test('stripOrphanBlobUrlTails refuses to touch a url that still carries a query string', () => {
  // 살아 있는 SAS를 만나면 잘린 반쪽 토큰을 만들지 않고 그대로 건너뛰어야 한다.
  const liveSas = `<a href="${ATTACH_URL}?sv=2026-02-06&rscd=attachment%3B%20filename*%3DUTF-8''enc.zip">x</a>`;

  assert.equal(stripOrphanBlobUrlTails(liveSas), liveSas);
});

test('stripOrphanBlobUrlTails handles a tail at the end of the document', () => {
  assert.equal(stripOrphanBlobUrlTails(`${ATTACH_URL}${TAIL}`), ATTACH_URL);
});

test('stripOrphanBlobUrlTails also repairs image container urls', () => {
  assert.equal(stripOrphanBlobUrlTails(`<img src="${IMAGE_URL}${TAIL}">`), `<img src="${IMAGE_URL}">`);
});

test('stripOrphanBlobUrlTails passes through non string and empty input', () => {
  assert.equal(stripOrphanBlobUrlTails(null), null);
  assert.equal(stripOrphanBlobUrlTails(undefined), undefined);
  assert.equal(stripOrphanBlobUrlTails(''), '');
});

test('countOrphanBlobUrlTails counts every corrupted link', () => {
  const corrupted = `<a href="${ATTACH_URL}${TAIL}">a</a><a href="${IMAGE_URL}${TAIL}">b</a>`;

  assert.equal(countOrphanBlobUrlTails(corrupted), 2);
  assert.equal(countOrphanBlobUrlTails(`<a href="${ATTACH_URL}">a</a>`), 0);
  assert.equal(countOrphanBlobUrlTails(''), 0);
  assert.equal(countOrphanBlobUrlTails(null), 0);
});

test('hasOrphanBlobUrlTail reports whether a repair is needed', () => {
  assert.equal(hasOrphanBlobUrlTail(`<a href="${ATTACH_URL}${TAIL}">a</a>`), true);
  assert.equal(hasOrphanBlobUrlTail(`<a href="${ATTACH_URL}">a</a>`), false);
  assert.equal(hasOrphanBlobUrlTail(`<p>${ATTACH_URL}'s metadata</p>`), false);
  assert.equal(hasOrphanBlobUrlTail(null), false);
});

test('firstOrphanBlobUrlTail returns the tail for audit sampling', () => {
  assert.equal(firstOrphanBlobUrlTail(`<a href="${ATTACH_URL}${TAIL}">a</a>`), TAIL);
  assert.equal(firstOrphanBlobUrlTail(`<a href="${ATTACH_URL}">a</a>`), null);
  assert.equal(firstOrphanBlobUrlTail(null), null);
});

test('shouldRepairPostContent guards on content shape and actual change', () => {
  assert.equal(shouldRepairPostContent({ contentMarkdown: `<a href="${ATTACH_URL}${TAIL}">a</a>` }), true);
  assert.equal(shouldRepairPostContent({ contentMarkdown: `<a href="${ATTACH_URL}">a</a>` }), false);
  assert.equal(shouldRepairPostContent({ contentMarkdown: '' }), false);
  assert.equal(shouldRepairPostContent({ contentMarkdown: null }), false);
  assert.equal(shouldRepairPostContent({}), false);
  assert.equal(shouldRepairPostContent(null), false);
});

test('shouldRepairPostContent still requires a tail when force is set', () => {
  assert.equal(shouldRepairPostContent({ contentMarkdown: `<a href="${ATTACH_URL}${TAIL}">a</a>` }, { force: true }), true);
  assert.equal(shouldRepairPostContent({ contentMarkdown: `<a href="${ATTACH_URL}">a</a>` }, { force: true }), false);
});

test('buildContentRepairPatch targets contentMarkdown only', () => {
  assert.deepEqual(
    buildContentRepairPatch({ content: '<p>x</p>' }),
    [{ op: 'set', path: '/contentMarkdown', value: '<p>x</p>' }]
  );
});
