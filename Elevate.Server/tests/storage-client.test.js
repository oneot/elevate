const test = require('node:test');
const assert = require('node:assert/strict');

const { getReadSasWindow, getStableReadSasWindow } = require('../src/services/storageClient');

test('stable read SAS window is fixed for the same UTC day', () => {
  const morning = getStableReadSasWindow(new Date('2026-05-28T01:15:00.000Z'));
  const evening = getStableReadSasWindow(new Date('2026-05-28T22:45:00.000Z'));

  assert.equal(morning.startsOn.toISOString(), '2026-05-27T23:55:00.000Z');
  assert.equal(morning.expiresOn.toISOString(), '2026-05-29T00:05:00.000Z');
  assert.equal(evening.startsOn.toISOString(), morning.startsOn.toISOString());
  assert.equal(evening.expiresOn.toISOString(), morning.expiresOn.toISOString());
});

test('stable read SAS window changes at the next UTC day', () => {
  const dayOne = getStableReadSasWindow(new Date('2026-05-28T23:59:59.000Z'));
  const dayTwo = getStableReadSasWindow(new Date('2026-05-29T00:00:00.000Z'));

  assert.notEqual(dayTwo.startsOn.toISOString(), dayOne.startsOn.toISOString());
  assert.equal(dayTwo.startsOn.toISOString(), '2026-05-28T23:55:00.000Z');
  assert.equal(dayTwo.expiresOn.toISOString(), '2026-05-30T00:05:00.000Z');
});

test('explicit invalid rolling SAS hours fall back to one hour instead of stable window', () => {
  const window = getReadSasWindow(0, new Date('2026-05-28T12:30:00.000Z'));

  assert.equal(window.startsOn.toISOString(), '2026-05-28T12:25:00.000Z');
  assert.equal(window.expiresOn.toISOString(), '2026-05-28T13:30:00.000Z');
});

test('non-image containers use one hour rolling SAS by default', () => {
  const window = getReadSasWindow(null, new Date('2026-05-28T12:30:00.000Z'), 'attachments');

  assert.equal(window.startsOn.toISOString(), '2026-05-28T12:25:00.000Z');
  assert.equal(window.expiresOn.toISOString(), '2026-05-28T13:30:00.000Z');
});
