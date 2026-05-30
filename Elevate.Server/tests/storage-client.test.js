const test = require('node:test');
const assert = require('node:assert/strict');

const { getReadSasWindow } = require('../src/services/storageClient');

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
