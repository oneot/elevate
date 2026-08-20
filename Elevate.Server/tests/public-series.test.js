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
const controllerPath = require.resolve('../src/controllers/postController');

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
const { getSeriesByCategory } = require('../src/controllers/postController');

test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[controllerPath];
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

test('getSeriesByCategory returns a series with one published post', async () => {
  mockResources = [{
    id: 'post-1',
    slug: 'post',
    title: '나만의 무드 타입 테스트 만들기',
    series: '입문 가이드',
    seriesOrder: 2
  }];
  const req = { query: { category: 'copilot-studio' }, correlationId: 'test' };
  const res = makeRes();

  await getSeriesByCategory(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody(), {
    items: [{
      name: '입문 가이드',
      posts: [{
        id: 'post-1',
        slug: 'post',
        title: '나만의 무드 타입 테스트 만들기',
        seriesOrder: 2
      }]
    }]
  });
  assert.match(lastQuerySpec.query, /p\.status = 'published'/);
  assert.deepEqual(lastQuerySpec.parameters, [
    { name: '@category', value: 'copilot-studio' }
  ]);
});
