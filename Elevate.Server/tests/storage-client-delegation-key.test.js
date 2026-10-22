const test = require('node:test');
const assert = require('node:assert/strict');

process.env.STORAGE_ACCOUNT_NAME = 'elevatetest';

const realStorageBlob = require('@azure/storage-blob');

const storageBlobPath = require.resolve('@azure/storage-blob');
const identityPath = require.resolve('@azure/identity');
const storageClientPath = require.resolve('../src/services/storageClient');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const START = Date.parse('2026-10-23T00:00:00.000Z');
const BLOB_URL = 'https://elevatetest.blob.core.windows.net/images/uploads/2026/10/photo.png';

function cacheModule(modulePath, exports) {
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports };
}

// Like Azure, the key covers the requested window truncated to whole seconds.
function fakeUserDelegationKey(startsOn, expiresOn) {
  return {
    signedObjectId: '00000000-0000-0000-0000-000000000001',
    signedTenantId: '00000000-0000-0000-0000-000000000002',
    signedStartsOn: new Date(Math.floor(startsOn.getTime() / SECOND) * SECOND),
    signedExpiresOn: new Date(Math.floor(expiresOn.getTime() / SECOND) * SECOND),
    signedService: 'b',
    signedVersion: '2025-11-05',
    value: Buffer.from('fake-user-delegation-key-for-tests').toString('base64'),
  };
}

// Loads a fresh storageClient whose BlobServiceClient is a fake that records key requests.
function loadStorageClient(t, requestKey = async (startsOn, expiresOn) => fakeUserDelegationKey(startsOn, expiresOn)) {
  const keyRequests = [];

  class FakeBlobServiceClient {
    constructor(url) {
      this.url = url;
    }

    getUserDelegationKey(startsOn, expiresOn) {
      keyRequests.push({ startsOn: startsOn.toISOString(), expiresOn: expiresOn.toISOString() });
      return requestKey(startsOn, expiresOn);
    }

    getContainerClient(containerName) {
      return {
        getBlockBlobClient: (blobName) => ({ url: `${this.url}/${containerName}/${blobName}` }),
      };
    }
  }

  const savedStorageBlob = require.cache[storageBlobPath];
  const savedIdentity = require.cache[identityPath];
  cacheModule(storageBlobPath, { ...realStorageBlob, BlobServiceClient: FakeBlobServiceClient });
  cacheModule(identityPath, { DefaultAzureCredential: class FakeCredential {} });
  delete require.cache[storageClientPath];
  const storageClient = require('../src/services/storageClient');

  t.after(() => {
    delete require.cache[storageClientPath];
    require.cache[storageBlobPath] = savedStorageBlob;
    if (savedIdentity) require.cache[identityPath] = savedIdentity;
    else delete require.cache[identityPath];
  });

  return { storageClient, keyRequests };
}

function startClock(t, now = START) {
  t.mock.timers.enable({ apis: ['Date'], now });
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function sasTime(ms) {
  return iso(Math.floor(ms / SECOND) * SECOND).replace('.000Z', 'Z');
}

function sasParams(signedUrl) {
  return new URL(signedUrl).searchParams;
}

test('signs every SAS in the reuse window with one user delegation key', async (t) => {
  startClock(t);
  const { storageClient, keyRequests } = loadStorageClient(t);

  for (const offset of [0, 10 * MINUTE, 30 * MINUTE, 59 * MINUTE]) {
    t.mock.timers.setTime(START + offset);
    for (let i = 0; i < 33; i += 1) {
      assert.ok(await storageClient.getBlobReadSasUrl(`${BLOB_URL}-${i}`));
    }
    await storageClient.issueBlobUploadSas({ fileName: 'photo.png' });
    await storageClient.issueBlobAttachSas({ fileName: 'deck.pdf' });
  }

  assert.deepEqual(keyRequests, [{
    startsOn: iso(START - 5 * MINUTE),
    expiresOn: iso(START + 2 * HOUR + 10 * MINUTE),
  }]);
});

test('requests a new key once a 1-hour read SAS would end within 10 minutes of the key expiry', async (t) => {
  startClock(t);
  const { storageClient, keyRequests } = loadStorageClient(t);

  await storageClient.getBlobReadSasUrl(BLOB_URL);
  t.mock.timers.setTime(START + HOUR);
  const lastReused = await storageClient.getBlobReadSasUrl(BLOB_URL);
  assert.equal(keyRequests.length, 1);
  assert.equal(sasParams(lastReused).get('se'), sasTime(START + 2 * HOUR));
  assert.equal(sasParams(lastReused).get('ske'), sasTime(START + 2 * HOUR + 10 * MINUTE));

  const refreshAt = START + HOUR + SECOND;
  t.mock.timers.setTime(refreshAt);
  const refreshed = await storageClient.getBlobReadSasUrl(BLOB_URL);

  assert.equal(keyRequests.length, 2);
  assert.deepEqual(keyRequests[1], {
    startsOn: iso(refreshAt - 5 * MINUTE),
    expiresOn: iso(refreshAt + 2 * HOUR + 10 * MINUTE),
  });
  assert.equal(sasParams(refreshed).get('ske'), sasTime(refreshAt + 2 * HOUR + 10 * MINUTE));

  t.mock.timers.setTime(refreshAt + 30 * MINUTE);
  await storageClient.getBlobReadSasUrl(BLOB_URL);
  assert.equal(keyRequests.length, 2);
});

test('upload SAS also move to a new key before the cached key gets too close to expiry', async (t) => {
  startClock(t);
  const { storageClient, keyRequests } = loadStorageClient(t);

  await storageClient.issueBlobUploadSas({ fileName: 'photo.png' });
  t.mock.timers.setTime(START + HOUR + 45 * MINUTE);
  await storageClient.issueBlobAttachSas({ fileName: 'deck.pdf' });
  assert.equal(keyRequests.length, 1);

  t.mock.timers.setTime(START + HOUR + 45 * MINUTE + SECOND);
  const upload = await storageClient.issueBlobUploadSas({ fileName: 'photo.png' });

  assert.equal(keyRequests.length, 2);
  assert.equal(
    sasParams(upload.uploadUrl).get('ske'),
    sasTime(START + HOUR + 45 * MINUTE + SECOND + 2 * HOUR + 10 * MINUTE)
  );
});

test('concurrent SAS requests share one in-flight key request', async (t) => {
  startClock(t);
  let releaseKey;
  const keyReleased = new Promise((resolve) => {
    releaseKey = resolve;
  });
  const { storageClient, keyRequests } = loadStorageClient(t, async (startsOn, expiresOn) => {
    await keyReleased;
    return fakeUserDelegationKey(startsOn, expiresOn);
  });

  const pending = [
    ...Array.from({ length: 33 }, (_, i) => storageClient.getBlobReadSasUrl(`${BLOB_URL}-${i}`)),
    storageClient.issueBlobUploadSas({ fileName: 'photo.png' }),
    storageClient.issueBlobAttachSas({ fileName: 'deck.pdf' }),
  ];
  await new Promise(setImmediate);
  assert.equal(keyRequests.length, 1);

  releaseKey();
  const results = await Promise.all(pending);
  const signedUrls = results.map((result) => (typeof result === 'string' ? result : result.uploadUrl));

  assert.equal(keyRequests.length, 1);
  assert.ok(signedUrls.every(Boolean));
  assert.deepEqual(
    [...new Set(signedUrls.map((signedUrl) => sasParams(signedUrl).get('ske')))],
    [sasTime(START + 2 * HOUR + 10 * MINUTE)]
  );
});

test('no SAS expires after the key that signs it', async (t) => {
  startClock(t);
  const { storageClient, keyRequests } = loadStorageClient(t);
  const signedUrls = [];

  // Odd steps with milliseconds walk across several refreshes and second truncation.
  for (let offset = 0; offset <= 5 * HOUR; offset += 7 * MINUTE + 13 * SECOND + 789) {
    t.mock.timers.setTime(START + offset);
    signedUrls.push(
      await storageClient.getBlobReadSasUrl(BLOB_URL),
      await storageClient.getBlobReadSasUrl(BLOB_URL, 2),
      await storageClient.getBlobReadSasUrl(BLOB_URL, 24),
      (await storageClient.issueBlobUploadSas({ fileName: 'photo.png' })).uploadUrl,
      (await storageClient.issueBlobAttachSas({ fileName: 'deck.pdf' })).uploadUrl
    );
  }

  assert.ok(keyRequests.length > 1);
  for (const signedUrl of signedUrls) {
    const params = sasParams(signedUrl);
    assert.ok(Date.parse(params.get('se')) <= Date.parse(params.get('ske')), signedUrl);
    assert.ok(Date.parse(params.get('skt')) <= Date.parse(params.get('st')), signedUrl);
  }
});

test('SAS longer than a shared key covers get their own key and keep the shared key', async (t) => {
  startClock(t);
  const { storageClient, keyRequests } = loadStorageClient(t);

  await storageClient.getBlobReadSasUrl(BLOB_URL);
  const longLived = await storageClient.getBlobReadSasUrl(BLOB_URL, 24);
  await storageClient.getBlobReadSasUrl(BLOB_URL);

  assert.deepEqual(keyRequests, [
    { startsOn: iso(START - 5 * MINUTE), expiresOn: iso(START + 2 * HOUR + 10 * MINUTE) },
    { startsOn: iso(START - 5 * MINUTE), expiresOn: iso(START + 24 * HOUR) },
  ]);
  assert.equal(sasParams(longLived).get('se'), sasTime(START + 24 * HOUR));
  assert.equal(sasParams(longLived).get('ske'), sasTime(START + 24 * HOUR));
});

test('a failed key request is not cached and the next SAS retries', async (t) => {
  startClock(t);
  t.mock.method(console, 'error', () => {});
  let failing = true;
  const { storageClient, keyRequests } = loadStorageClient(t, async (startsOn, expiresOn) => {
    if (failing) throw new Error('user delegation key unavailable');
    return fakeUserDelegationKey(startsOn, expiresOn);
  });

  assert.deepEqual(
    await Promise.all([storageClient.getBlobReadSasUrl(BLOB_URL), storageClient.getBlobReadSasUrl(BLOB_URL)]),
    [null, null]
  );
  assert.equal(keyRequests.length, 1);
  await assert.rejects(storageClient.issueBlobUploadSas({ fileName: 'photo.png' }), /user delegation key unavailable/);
  assert.equal(keyRequests.length, 2);

  failing = false;
  assert.ok(await storageClient.getBlobReadSasUrl(BLOB_URL));
  assert.ok(await storageClient.issueBlobAttachSas({ fileName: 'deck.pdf' }));
  assert.equal(keyRequests.length, 3);
});

test('SAS format, permissions, lifetimes and clock-skew start are unchanged', async (t) => {
  startClock(t);
  const { storageClient } = loadStorageClient(t);

  const read = new URL(await storageClient.getBlobReadSasUrl(BLOB_URL, undefined, { downloadFileName: 'deck.pdf' }));
  assert.equal(read.origin + read.pathname, BLOB_URL);
  assert.equal(read.searchParams.get('sp'), 'r');
  assert.equal(read.searchParams.get('spr'), 'https');
  assert.equal(read.searchParams.get('sr'), 'b');
  assert.equal(read.searchParams.get('st'), sasTime(START - 5 * MINUTE));
  assert.equal(read.searchParams.get('se'), sasTime(START + HOUR));
  assert.equal(read.searchParams.get('rscd'), "attachment; filename=\"deck.pdf\"; filename*=UTF-8''deck.pdf");
  assert.ok(read.searchParams.get('sig'));

  for (const [issue, container, prefix, fileName] of [
    [storageClient.issueBlobUploadSas, 'images', 'uploads', 'photo.PNG'],
    [storageClient.issueBlobAttachSas, 'attachments', 'attach', 'deck.pdf'],
  ]) {
    const payload = await issue({ fileName });
    const upload = new URL(payload.uploadUrl);
    const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    assert.equal(payload.blobUrl, upload.origin + upload.pathname);
    assert.ok(
      payload.blobUrl.startsWith(`https://elevatetest.blob.core.windows.net/${container}/${prefix}/2026/10/`),
      payload.blobUrl
    );
    assert.ok(payload.blobUrl.endsWith(extension), payload.blobUrl);
    assert.equal(upload.searchParams.get('sp'), 'cw');
    assert.equal(upload.searchParams.get('spr'), 'https');
    assert.equal(upload.searchParams.get('sr'), 'b');
    assert.equal(upload.searchParams.get('st'), sasTime(START - 5 * MINUTE));
    assert.equal(upload.searchParams.get('se'), sasTime(START + 15 * MINUTE));
    assert.equal(payload.expiresAt, iso(START + 15 * MINUTE));
  }
});
