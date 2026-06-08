const test = require('node:test');
const assert = require('node:assert/strict');

let createdFileDocument = null;

const mockAssetsContainer = {
  items: {
    create: async (doc) => {
      createdFileDocument = doc;
      return { resource: doc };
    }
  }
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
    getPostsContainer: () => mockAssetsContainer
  }
};

require.cache[storageClientPath] = {
  id: storageClientPath,
  filename: storageClientPath,
  loaded: true,
  exports: {
    issueBlobUploadSas: async () => ({}),
    issueBlobAttachSas: async () => ({}),
    getBlobReadSasUrl: async (blobUrl) => `${blobUrl}?signed=1`,
    deleteBlobByUrl: async () => {}
  }
};

delete require.cache[controllerPath];
const { _test, createFileMetadata } = require('../src/controllers/adminController');

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
    }
  };
}

test('normalizeDraftSessionId accepts generated draft ids', () => {
  assert.equal(
    _test.normalizeDraftSessionId('draft-123e4567-e89b-12d3-a456-426614174000'),
    'draft-123e4567-e89b-12d3-a456-426614174000'
  );
});

test('normalizeDraftSessionId rejects unsafe or empty values', () => {
  assert.equal(_test.normalizeDraftSessionId(''), null);
  assert.equal(_test.normalizeDraftSessionId(null), null);
  assert.equal(_test.normalizeDraftSessionId(0), null);
  assert.equal(_test.normalizeDraftSessionId('../draft-123'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-abc<script>'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-' + 'a'.repeat(90)), null);
});

test('buildDraftAttachmentQuery scopes by draftSessionId and attach type', () => {
  const query = _test.buildDraftAttachmentQuery('draft-123e4567-e89b-12d3-a456-426614174000');

  assert.equal(
    query.query,
    'SELECT * FROM c WHERE c.draftSessionId = @draftSessionId AND c.documentType = "attach"'
  );
  assert.deepEqual(query.parameters, [
    { name: '@draftSessionId', value: 'draft-123e4567-e89b-12d3-a456-426614174000' }
  ]);
});

test('createFileMetadata rejects provided invalid draftSessionId values', async () => {
  createdFileDocument = null;
  const req = {
    body: {
      draftSessionId: 0,
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x',
    params: {},
    query: {}
  };
  const res = makeRes();

  await createFileMetadata(req, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'Invalid draftSessionId');
  assert.equal(createdFileDocument, null);
});
