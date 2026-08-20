const test = require('node:test');
const assert = require('node:assert/strict');

let lastQuerySpec = null;
let mockResources = [];

const mockContainer = {
  items: {
    query: (querySpec) => {
      lastQuerySpec = querySpec;
      return {
        fetchAll: async () => ({ resources: mockResources })
      };
    }
  }
};

const cosmosClientPath = require.resolve('../src/services/cosmosClient');
const controllerPath = require.resolve('../src/controllers/adminController');

require.cache[cosmosClientPath] = {
  id: cosmosClientPath,
  filename: cosmosClientPath,
  loaded: true,
  exports: {
    getAssetsContainer: () => mockContainer,
    getPostsContainer: () => mockContainer
  }
};
delete require.cache[controllerPath];
const { getAdminSeriesList } = require('../src/controllers/adminController');

test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[controllerPath];
});

test.beforeEach(() => {
  lastQuerySpec = null;
  mockResources = [];
});

function makeRes() {
  let statusCode = 200;
  let body = null;
  return {
    status(code) { statusCode = code; return this; },
    json(payload) { body = payload; return this; },
    getStatus: () => statusCode,
    getBody: () => body
  };
}

test('getAdminSeriesList returns draft and single-post series names', async () => {
  mockResources = ['Solo Draft', ' Existing Series ', 'Solo Draft', null, ''];
  const req = { query: { category: 'copilot-studio' }, correlationId: 'test' };
  const res = makeRes();

  await getAdminSeriesList(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody(), {
    items: [
      { name: 'Existing Series' },
      { name: 'Solo Draft' }
    ]
  });
  assert.doesNotMatch(lastQuerySpec.query, /status\s*=\s*'published'/);
  assert.match(lastQuerySpec.query, /SELECT DISTINCT VALUE p\.series/);
  assert.deepEqual(lastQuerySpec.parameters, [
    { name: '@category', value: 'copilot-studio' }
  ]);
});

test('admin series function exposes the authenticated admin route', () => {
  const { functionDefinition } = require('../src/functions/adminSeriesList');

  assert.equal(functionDefinition.route, 'api/admin/series');
  assert.deepEqual(functionDefinition.methods, ['GET']);
  assert.equal(typeof functionDefinition.handler, 'function');
});
