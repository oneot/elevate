const test = require('node:test');
const assert = require('node:assert/strict');

let lastSignedUrlArgs = [];
let lastCreatedDoc = null;
let mockFiles = [];
let lastQuerySpec = null;

const mockAssetsContainer = {
  items: {
    create: async (doc) => {
      lastCreatedDoc = doc;
      return { resource: doc };
    },
    query: (querySpec) => {
      lastQuerySpec = querySpec;
      return {
        fetchAll: async () => ({ resources: mockFiles }),
      };
    },
  },
};

const cosmosClientPath = require.resolve('../src/services/cosmosClient');
const storageClientPath = require.resolve('../src/services/storageClient');
const controllerPath = require.resolve('../src/controllers/adminController');

require.cache[cosmosClientPath] = {
  id: cosmosClientPath,
  filename: cosmosClientPath,
  loaded: true,
  exports: {
    getAssetsContainer: () => mockAssetsContainer,
    getPostsContainer: () => mockAssetsContainer,
  },
};

require.cache[storageClientPath] = {
  id: storageClientPath,
  filename: storageClientPath,
  loaded: true,
  exports: {
    issueBlobUploadSas: async () => ({}),
    issueBlobAttachSas: async () => ({}),
    getBlobReadSasUrl: async (blobUrl, validHours, options = {}) => {
      lastSignedUrlArgs.push({ blobUrl, validHours, options });
      return `${blobUrl}?signed=1`;
    },
    deleteBlobByUrl: async () => {},
  },
};

delete require.cache[controllerPath];
const ctrl = require('../src/controllers/adminController');

test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[storageClientPath];
  delete require.cache[controllerPath];
});

function makeRes() {
  let statusCode = 200;
  let body = null;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return this;
    },
    send() {
      return this;
    },
    getStatus() {
      return statusCode;
    },
    getBody() {
      return body;
    },
  };
}

test('createFileMetadata trims fileName before storage and signed URL generation', async () => {
  lastSignedUrlArgs = [];
  lastCreatedDoc = null;

  const req = {
    body: {
      postId: 'post-1',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: "  O'Reilly (final).pdf  ",
    },
    correlationId: 'x',
    params: {},
    query: {},
  };
  const res = makeRes();

  await ctrl.createFileMetadata(req, res);

  assert.equal(res.getStatus(), 201);
  assert.equal(lastCreatedDoc.fileName, "O'Reilly (final).pdf");
  assert.deepEqual(lastSignedUrlArgs[0].options, {
    downloadFileName: "O'Reilly (final).pdf",
  });
  assert.equal(res.getBody().fileName, "O'Reilly (final).pdf");
});

test('createAssetMetadata keeps image signed URL inline without download filename', async () => {
  lastSignedUrlArgs = [];
  lastCreatedDoc = null;

  const req = {
    body: {
      postId: 'post-1',
      blobUrl: 'https://account.blob.core.windows.net/images/assets/2026/06/banner.png',
      contentType: 'image/png',
      sizeBytes: 1234,
      fileName: '배너.png',
    },
    correlationId: 'x',
    params: {},
    query: {},
  };
  const res = makeRes();

  await ctrl.createAssetMetadata(req, res);

  assert.equal(res.getStatus(), 201);
  assert.equal(lastCreatedDoc.fileName, '배너.png');
  assert.deepEqual(lastSignedUrlArgs[0], {
    blobUrl: 'https://account.blob.core.windows.net/images/assets/2026/06/banner.png',
    validHours: undefined,
    options: {},
  });
});

test('getFiles passes each attachment fileName to signed URL generation', async () => {
  lastSignedUrlArgs = [];
  lastQuerySpec = null;
  mockFiles = [
    {
      id: '1',
      fileName: '회의자료 2026년 6월.xlsx',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/a.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      sizeBytes: 1024,
    },
  ];

  const req = { correlationId: 'x', params: {}, query: { postId: 'post-1' } };
  const res = makeRes();

  await ctrl.getFiles(req, res);

  assert.equal(res.getStatus(), 200);
  assert.equal(lastQuerySpec.query, 'SELECT c.id, c.fileName, c.blobUrl, c.contentType, c.sizeBytes FROM c WHERE c.postId = @postId AND c.documentType = "attach"');
  assert.deepEqual(lastQuerySpec.parameters, [{ name: '@postId', value: 'post-1' }]);
  assert.deepEqual(lastSignedUrlArgs[0].options, {
    downloadFileName: '회의자료 2026년 6월.xlsx',
  });
  assert.equal(res.getBody()[0].signedUrl, 'https://account.blob.core.windows.net/attachments/attach/2026/06/a.xlsx?signed=1');
});

test('getFiles can list draft attachments by draftSessionId', async () => {
  lastSignedUrlArgs = [];
  lastQuerySpec = null;
  mockFiles = [
    {
      id: 'draft-file-1',
      fileName: 'draft.pdf',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/draft.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
    },
  ];

  const req = {
    correlationId: 'x',
    params: {},
    query: { draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000' },
  };
  const res = makeRes();

  await ctrl.getFiles(req, res);

  assert.equal(res.getStatus(), 200);
  assert.equal(lastQuerySpec.query, 'SELECT c.id, c.fileName, c.blobUrl, c.contentType, c.sizeBytes FROM c WHERE c.draftSessionId = @draftSessionId AND c.documentType = "attach"');
  assert.deepEqual(lastQuerySpec.parameters, [
    { name: '@draftSessionId', value: 'draft-123e4567-e89b-42d3-a456-426614174000' },
  ]);
  assert.equal(res.getBody()[0].id, 'draft-file-1');
});
