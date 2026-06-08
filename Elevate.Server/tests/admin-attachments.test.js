const test = require('node:test');
const assert = require('node:assert/strict');

let createdFileDocument = null;
let mockPostResources = [];
let mockDraftAttachmentResources = [];
let mockExpiredDraftAttachmentResources = [];
let replacedFileDocuments = [];
let deletedFileDocuments = [];
let deletedBlobUrls = [];

const mockAssetsContainer = {
  items: {
    create: async (doc) => {
      createdFileDocument = doc;
      return { resource: doc };
    },
    query: (querySpec) => ({
      fetchAll: async () => ({
        resources: querySpec.query.includes('c.expiresAt < @now')
          ? mockExpiredDraftAttachmentResources
          : mockDraftAttachmentResources
      })
    })
  },
  item: (id, partitionKey) => ({
    replace: async (doc) => {
      replacedFileDocuments.push({ id, partitionKey, doc });
      return { resource: doc };
    },
    delete: async () => {
      deletedFileDocuments.push({ id, partitionKey });
    }
  })
};

const mockPostsContainer = {
  items: {
    query: () => ({
      fetchAll: async () => ({ resources: mockPostResources })
    })
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
    getPostsContainer: () => mockPostsContainer
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
    deleteBlobByUrl: async (blobUrl) => {
      deletedBlobUrls.push(blobUrl);
    }
  }
};

delete require.cache[controllerPath];
const { _test, createFileMetadata, linkDraftAttachmentsToPost } = require('../src/controllers/adminController');

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
    _test.normalizeDraftSessionId('draft-123e4567-e89b-42d3-a456-426614174000'),
    'draft-123e4567-e89b-42d3-a456-426614174000'
  );
});

test('normalizeDraftSessionId rejects unsafe or empty values', () => {
  assert.equal(_test.normalizeDraftSessionId(''), null);
  assert.equal(_test.normalizeDraftSessionId(null), null);
  assert.equal(_test.normalizeDraftSessionId(0), null);
  assert.equal(_test.normalizeDraftSessionId('../draft-123'), null);
  assert.equal(_test.normalizeDraftSessionId('draft--------'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-abc<script>'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-' + 'a'.repeat(90)), null);
});

test('buildDraftAttachmentQuery scopes by draftSessionId and attach type', () => {
  const query = _test.buildDraftAttachmentQuery('draft-123e4567-e89b-42d3-a456-426614174000');

  assert.equal(
    query.query,
    'SELECT * FROM c WHERE c.draftSessionId = @draftSessionId AND c.documentType = "attach"'
  );
  assert.deepEqual(query.parameters, [
    { name: '@draftSessionId', value: 'draft-123e4567-e89b-42d3-a456-426614174000' }
  ]);
});

test('buildExpiredDraftAttachmentQuery scopes stale draft attachments', () => {
  const query = _test.buildExpiredDraftAttachmentQuery('2026-06-08T00:00:00.000Z');

  assert.equal(
    query.query,
    'SELECT TOP 50 c.id, c.category, c.partitionKey, c.blobUrl FROM c WHERE c.documentType = "attach" AND IS_DEFINED(c.draftSessionId) AND c.draftSessionId != null AND IS_DEFINED(c.expiresAt) AND c.expiresAt < @now'
  );
  assert.deepEqual(query.parameters, [
    { name: '@now', value: '2026-06-08T00:00:00.000Z' }
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

test('createFileMetadata rejects orphan attachment metadata', async () => {
  createdFileDocument = null;
  const res = makeRes();

  await createFileMetadata({
    body: {
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'postId or draftSessionId is required');
  assert.equal(createdFileDocument, null);
});

test('createFileMetadata rejects empty postId values', async () => {
  createdFileDocument = null;
  const res = makeRes();

  await createFileMetadata({
    body: {
      postId: '   ',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'postId must be a non-empty string');
  assert.equal(createdFileDocument, null);
});

test('createFileMetadata rejects simultaneous postId and draftSessionId', async () => {
  createdFileDocument = null;
  const res = makeRes();

  await createFileMetadata({
    body: {
      postId: 'post-1',
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'Provide either postId or draftSessionId, not both');
  assert.equal(createdFileDocument, null);
});

test('createFileMetadata stores trimmed postId and clears draftSessionId for saved posts', async () => {
  createdFileDocument = null;
  const res = makeRes();

  await createFileMetadata({
    body: {
      postId: ' post-1 ',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 201);
  assert.equal(createdFileDocument.postId, 'post-1');
  assert.equal(createdFileDocument.draftSessionId, null);
});

test('createFileMetadata stores expiry and removes stale draft attachments', async () => {
  createdFileDocument = null;
  mockExpiredDraftAttachmentResources = [
    {
      id: 'expired-file',
      documentType: 'attach',
      category: '_attach',
      partitionKey: '_attach',
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/expired.pdf',
      fileName: 'expired.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
      expiresAt: '2026-06-01T00:00:00.000Z'
    }
  ];
  deletedFileDocuments = [];
  deletedBlobUrls = [];
  const res = makeRes();

  await createFileMetadata({
    body: {
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1234,
      fileName: 'file.pdf'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 201);
  assert.equal(createdFileDocument.postId, null);
  assert.equal(createdFileDocument.draftSessionId, 'draft-123e4567-e89b-42d3-a456-426614174000');
  assert.match(createdFileDocument.expiresAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(createdFileDocument.ttl, 86400);
  assert.deepEqual(deletedBlobUrls, [
    'https://account.blob.core.windows.net/attachments/attach/2026/06/expired.pdf'
  ]);
  assert.deepEqual(deletedFileDocuments, [
    { id: 'expired-file', partitionKey: '_attach' }
  ]);

  mockExpiredDraftAttachmentResources = [];
});

test('linkDraftAttachmentsToPost rejects missing postId or draftSessionId', async () => {
  const res = makeRes();

  await linkDraftAttachmentsToPost({
    body: {
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'draftSessionId and postId are required');
});

test('linkDraftAttachmentsToPost rejects empty postId values', async () => {
  const res = makeRes();

  await linkDraftAttachmentsToPost({
    body: {
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      postId: '   '
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().code, 'BadRequest');
  assert.equal(res.getBody().message, 'draftSessionId and postId are required');
});

test('linkDraftAttachmentsToPost returns 404 when post does not exist', async () => {
  mockPostResources = [];
  const res = makeRes();

  await linkDraftAttachmentsToPost({
    body: {
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      postId: 'post-1'
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 404);
  assert.equal(res.getBody().code, 'NotFound');
  assert.equal(res.getBody().message, 'Post not found');
});

test('linkDraftAttachmentsToPost links draft attachments and clears draftSessionId', async () => {
  mockPostResources = [{ id: 'post-1', documentType: 'post' }];
  mockDraftAttachmentResources = [
    {
      id: 'file-1',
      documentType: 'attach',
      category: '_attach',
      partitionKey: '_attach',
      postId: null,
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file-1.pdf',
      fileName: 'file-1.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
      updatedAt: '2026-06-01T00:00:00.000Z'
    },
    {
      id: 'file-2',
      documentType: 'attach',
      category: '_attach',
      partitionKey: '_attach',
      postId: null,
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      blobUrl: 'https://account.blob.core.windows.net/attachments/attach/2026/06/file-2.pdf',
      fileName: 'file-2.pdf',
      contentType: 'application/pdf',
      sizeBytes: 200,
      updatedAt: '2026-06-01T00:00:00.000Z'
    }
  ];
  replacedFileDocuments = [];
  const res = makeRes();

  await linkDraftAttachmentsToPost({
    body: {
      draftSessionId: 'draft-123e4567-e89b-42d3-a456-426614174000',
      postId: ' post-1 '
    },
    correlationId: 'x'
  }, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody(), { linked: 2 });
  assert.deepEqual(
    replacedFileDocuments.map(({ id, partitionKey }) => [id, partitionKey]),
    [
      ['file-1', '_attach'],
      ['file-2', '_attach']
    ]
  );
  assert.deepEqual(
    replacedFileDocuments.map(({ doc }) => ({
      id: doc.id,
      postId: doc.postId,
      draftSessionId: doc.draftSessionId,
      ttl: doc.ttl
    })),
    [
      { id: 'file-1', postId: 'post-1', draftSessionId: null, ttl: null },
      { id: 'file-2', postId: 'post-1', draftSessionId: null, ttl: null }
    ]
  );
  assert.match(replacedFileDocuments[0].doc.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});
