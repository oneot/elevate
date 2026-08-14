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

test('download content disposition percent-encodes RFC 5987 reserved characters', () => {
  const disposition = _test.buildDownloadContentDisposition("O'Reilly (final).pdf");

  assert.equal(
    disposition,
    "attachment; filename=\"O'Reilly (final).pdf\"; filename*=UTF-8''O%27Reilly%20%28final%29.pdf"
  );
});

test('download content disposition sanitizes path separators in fallback filename', () => {
  const disposition = _test.buildDownloadContentDisposition('folder/report.pdf');

  assert.equal(
    disposition,
    "attachment; filename=\"folder_report.pdf\"; filename*=UTF-8''folder_report.pdf"
  );
});

test('download content disposition sanitizes Windows reserved filename characters', () => {
  const disposition = _test.buildDownloadContentDisposition('meeting:final*draft?<v1>|.pdf');

  assert.equal(
    disposition,
    "attachment; filename=\"meeting_final_draft__v1__.pdf\"; filename*=UTF-8''meeting_final_draft__v1__.pdf"
  );
});

test('download content disposition normalizes decomposed Korean file names to NFC', () => {
  // macOS Finder가 넘기는 NFD 파일명. 소스 리터럴로 적으면 파일 인코딩에 따라
  // 테스트가 조용히 무력화되므로 반드시 normalize('NFD')로 만든다.
  const decomposed = '맞춤법 탐정단.zip'.normalize('NFD');
  assert.notEqual(decomposed, '맞춤법 탐정단.zip');

  assert.equal(
    _test.buildDownloadContentDisposition(decomposed),
    _test.buildDownloadContentDisposition('맞춤법 탐정단.zip')
  );
  assert.equal(
    _test.buildDownloadContentDisposition(decomposed),
    "attachment; filename=\"___ ___.zip\"; filename*=UTF-8''%EB%A7%9E%EC%B6%A4%EB%B2%95%20%ED%83%90%EC%A0%95%EB%8B%A8.zip"
  );
});

test('html safe sas token percent-encodes the characters encodeURIComponent leaves behind', () => {
  assert.equal(_test.toHtmlSafeSasToken("rscd=UTF-8''name(1).zip"), 'rscd=UTF-8%27%27name%281%29.zip');
});

test('html safe sas token leaves structural and already encoded characters alone', () => {
  const token = 'sv=2026-02-06&sr=b&sp=r&sig=aB%2B%2Fcd%3D&se=2026-08-14T08%3A07%3A44Z~-_.';

  assert.equal(_test.toHtmlSafeSasToken(token), token);
});

test('html safe sas token passes through empty and non string input', () => {
  assert.equal(_test.toHtmlSafeSasToken(''), '');
  assert.equal(_test.toHtmlSafeSasToken(null), null);
  assert.equal(_test.toHtmlSafeSasToken(undefined), undefined);
});
