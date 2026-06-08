const test = require('node:test');
const assert = require('node:assert/strict');

let docs = [];
let lastQuerySpec = null;
let deletedItem = null;

const mockContainer = {
  items: {
    query: (querySpec) => {
      lastQuerySpec = querySpec;
      return { fetchAll: async () => ({ resources: docs }) };
    },
    create: async (doc) => {
      docs.push(doc);
      return { resource: doc };
    },
  },
  item: (id, pk) => ({
    read: async () => {
      const resource = docs.find((doc) => doc.id === id && doc.partitionKey === pk);
      if (!resource) {
        const err = new Error('not found');
        err.code = 404;
        throw err;
      }
      return { resource };
    },
    replace: async (doc) => {
      docs = docs.map((existing) => (existing.id === id ? doc : existing));
      return { resource: doc };
    },
    delete: async () => {
      deletedItem = { id, pk };
      docs = docs.filter((doc) => doc.id !== id);
      return {};
    },
  }),
};

const cosmosClientPath = require.resolve('../src/services/cosmosClient');
const ctrlPath = require.resolve('../src/controllers/activityVideoController');

require.cache[cosmosClientPath] = {
  id: cosmosClientPath,
  filename: cosmosClientPath,
  loaded: true,
  exports: { getActivityVideosContainer: () => mockContainer },
};

delete require.cache[ctrlPath];
const ctrl = require('../src/controllers/activityVideoController');

test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[ctrlPath];
});

test.beforeEach(() => {
  docs = [];
  lastQuerySpec = null;
  deletedItem = null;
});

function makeRes() {
  let _status = 200;
  let _body = null;
  return {
    status(code) { _status = code; return this; },
    json(body) { _body = body; return this; },
    send() { return this; },
    getStatus: () => _status,
    getBody: () => _body,
  };
}

test('listPublicActivityVideos returns only published videos query ordered by sortOrder', async () => {
  docs = [
    { id: '1', type: 'activityVideo', partitionKey: 'activityVideo', videoId: 'SfK1hajr5qY', title: 'A', category: '행사', year: '2026', channel: 'Microsoft Korea', sortOrder: 20, status: 'published', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  ];
  const res = makeRes();

  await ctrl.listPublicActivityVideos({ query: {}, params: {}, correlationId: 'x' }, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody().items.map((item) => item.id), ['1']);
  assert.match(lastQuerySpec.query, /c.status = @status/);
  assert.match(lastQuerySpec.query, /ORDER BY c.sortOrder ASC, c.createdAt DESC/);
});

test('createActivityVideo rejects invalid YouTube videoId', async () => {
  const res = makeRes();

  await ctrl.createActivityVideo({
    body: { videoId: 'bad', title: 'Title', category: '행사', year: '2026' },
    params: {},
    query: {},
    correlationId: 'x',
  }, res);

  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'videoId must be an 11-character YouTube ID');
});

test('createActivityVideo creates normalized draft video', async () => {
  const res = makeRes();

  await ctrl.createActivityVideo({
    body: { videoId: 'SfK1hajr5qY', title: '  Title  ', category: ' 행사 ', year: ' 2026 ', sortOrder: '5' },
    params: {},
    query: {},
    correlationId: 'x',
  }, res);

  assert.equal(res.getStatus(), 201);
  assert.equal(res.getBody().title, 'Title');
  assert.equal(res.getBody().status, 'draft');
  assert.equal(res.getBody().channel, 'Microsoft Korea');
  assert.equal(res.getBody().sortOrder, 5);
  assert.equal(docs[0].partitionKey, 'activityVideo');
});

test('updateActivityVideo clears description and publishes video', async () => {
  docs = [{
    id: 'video-1',
    type: 'activityVideo',
    partitionKey: 'activityVideo',
    videoId: 'SfK1hajr5qY',
    title: 'Old',
    description: 'Old desc',
    category: '행사',
    year: '2026',
    channel: 'Microsoft Korea',
    sortOrder: 1,
    status: 'draft',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }];
  const res = makeRes();

  await ctrl.updateActivityVideo({
    body: { description: '', status: 'published' },
    params: { activityVideoId: 'video-1' },
    query: {},
    correlationId: 'x',
  }, res);

  assert.equal(res.getStatus(), 200);
  assert.equal(res.getBody().description, null);
  assert.equal(res.getBody().status, 'published');
});

test('deleteActivityVideo returns 204', async () => {
  docs = [{ id: 'video-1', type: 'activityVideo', partitionKey: 'activityVideo' }];
  const res = makeRes();

  await ctrl.deleteActivityVideo({
    body: null,
    params: { activityVideoId: 'video-1' },
    query: {},
    correlationId: 'x',
  }, res);

  assert.equal(res.getStatus(), 204);
  assert.deepEqual(deletedItem, { id: 'video-1', pk: 'activityVideo' });
});
