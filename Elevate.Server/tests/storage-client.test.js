const test = require('node:test');
const assert = require('node:assert/strict');

const { getReadSasWindow, _test } = require('../src/services/storageClient');

test('explicit invalid rolling SAS hours fall back to one hour instead of stable window', () => {
  const window = getReadSasWindow(0, new Date('2026-05-28T12:30:00.000Z'));

  assert.equal(window.startsOn.toISOString(), '2026-05-28T12:25:00.000Z');
  assert.equal(window.expiresOn.toISOString(), '2026-05-28T13:30:00.000Z');
});

test('image container read SAS uses one hour rolling window by default', () => {
  const window = getReadSasWindow(null, new Date('2026-05-28T12:30:00.000Z'), 'images');

  assert.equal(window.startsOn.toISOString(), '2026-05-28T12:25:00.000Z');
  assert.equal(window.expiresOn.toISOString(), '2026-05-28T13:30:00.000Z');
});

test('non-image containers use one hour rolling SAS by default', () => {
  const window = getReadSasWindow(null, new Date('2026-05-28T12:30:00.000Z'), 'attachments');

  assert.equal(window.startsOn.toISOString(), '2026-05-28T12:25:00.000Z');
  assert.equal(window.expiresOn.toISOString(), '2026-05-28T13:30:00.000Z');
});

test('download content disposition encodes UTF-8 filename for attachment downloads', () => {
  const disposition = _test.buildDownloadContentDisposition('회의자료 2026년 6월.xlsx');

  assert.equal(
    disposition,
    "attachment; filename=\"____ 2026_ 6_.xlsx\"; filename*=UTF-8''%ED%9A%8C%EC%9D%98%EC%9E%90%EB%A3%8C%202026%EB%85%84%206%EC%9B%94.xlsx"
  );
});
