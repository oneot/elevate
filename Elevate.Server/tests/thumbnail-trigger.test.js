const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

const { getThumbnailTriggerConfig, requestPostThumbnail } = require('../src/services/thumbnailTrigger');

const publishedPost = { id: 'p1', category: 'm365', slug: 'new-post', status: 'published' };
const tokenEnv = { THUMBNAIL_DISPATCH_TOKEN: 'secret-token' };

function createFetchRecorder(response = { ok: true, status: 204 }) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { text: async () => '', ...response };
  };
  return { calls, fetchImpl };
}

test('requestPostThumbnail skips posts that are not published', async () => {
  const { calls, fetchImpl } = createFetchRecorder();

  for (const post of [null, { ...publishedPost, status: 'draft' }, { ...publishedPost, status: 'archived' }]) {
    assert.equal(await requestPostThumbnail(post, { env: tokenEnv, fetchImpl }), 'skipped');
  }
  assert.equal(calls.length, 0);
});

test('requestPostThumbnail does nothing without a dispatch token', async () => {
  const { calls, fetchImpl } = createFetchRecorder();

  assert.equal(await requestPostThumbnail(publishedPost, { env: {}, fetchImpl }), 'disabled');
  assert.equal(await requestPostThumbnail(publishedPost, { env: { THUMBNAIL_DISPATCH_TOKEN: '  ' }, fetchImpl }), 'disabled');
  assert.equal(calls.length, 0);
});

test('requestPostThumbnail dispatches the save workflow on main', async () => {
  const { calls, fetchImpl } = createFetchRecorder();

  assert.equal(await requestPostThumbnail(publishedPost, { env: tokenEnv, fetchImpl }), 'requested');
  assert.equal(calls.length, 1);

  const [{ url, init }] = calls;
  assert.equal(url, 'https://api.github.com/repos/oneot/elevate/actions/workflows/post-thumbnails-on-save.yml/dispatches');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.Authorization, 'Bearer secret-token');
  assert.equal(init.headers.Accept, 'application/vnd.github+json');
  assert.equal(init.headers['X-GitHub-Api-Version'], '2022-11-28');
  assert.deepEqual(JSON.parse(init.body), { ref: 'main', inputs: { post: 'm365/new-post' } });
  assert.ok(init.signal instanceof AbortSignal);
});

test('requestPostThumbnail honours repository, workflow and ref overrides', async () => {
  const { calls, fetchImpl } = createFetchRecorder();
  const env = {
    ...tokenEnv,
    THUMBNAIL_DISPATCH_REPOSITORY: 'someone/fork',
    THUMBNAIL_DISPATCH_WORKFLOW: 'thumbs.yaml',
    THUMBNAIL_DISPATCH_REF: 'develop'
  };

  assert.equal(await requestPostThumbnail(publishedPost, { env, fetchImpl }), 'requested');
  assert.equal(calls[0].url, 'https://api.github.com/repos/someone/fork/actions/workflows/thumbs.yaml/dispatches');
  assert.equal(JSON.parse(calls[0].init.body).ref, 'develop');
});

test('getThumbnailTriggerConfig rejects repository or workflow values that would change the API path', (t) => {
  t.mock.method(console, 'warn', () => {});

  assert.equal(getThumbnailTriggerConfig({ ...tokenEnv, THUMBNAIL_DISPATCH_REPOSITORY: 'oneot/elevate/../other' }), null);
  assert.equal(getThumbnailTriggerConfig({ ...tokenEnv, THUMBNAIL_DISPATCH_WORKFLOW: '../dispatches' }), null);
  assert.equal(getThumbnailTriggerConfig({ ...tokenEnv, THUMBNAIL_DISPATCH_WORKFLOW: 'deploy.sh' }), null);
});

test('requestPostThumbnail reports GitHub errors without the token and never throws', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const { fetchImpl } = createFetchRecorder({
    ok: false,
    status: 403,
    text: async () => '{"message":"Resource not accessible by personal access token"}'
  });

  assert.equal(await requestPostThumbnail(publishedPost, { env: tokenEnv, fetchImpl }), 'failed');
  assert.equal(await requestPostThumbnail(publishedPost, {
    env: tokenEnv,
    fetchImpl: async () => { throw new Error('getaddrinfo ENOTFOUND api.github.com'); }
  }), 'failed');

  const messages = warn.mock.calls.map((call) => call.arguments.join(' '));
  assert.match(messages[0], /HTTP 403 .*Resource not accessible/);
  assert.match(messages[1], /ENOTFOUND/);
  assert.ok(messages.every((message) => !message.includes('secret-token')));
});

test('requestPostThumbnail gives up after the timeout', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const fetchImpl = (url, init) => new Promise((resolve, reject) => {
    // AbortSignal.timeout 타이머는 이벤트 루프를 붙잡지 않으므로, 실제 요청처럼 루프를 유지한다.
    const keepAlive = setInterval(() => {}, 50);
    init.signal.addEventListener('abort', () => {
      clearInterval(keepAlive);
      reject(init.signal.reason);
    });
  });

  assert.equal(await requestPostThumbnail(publishedPost, { env: tokenEnv, fetchImpl, timeoutMs: 10 }), 'failed');
});

test('local settings example leaves the thumbnail dispatch token empty', () => {
  const settingsPath = path.join(__dirname, '..', 'local.settings.json.example');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  assert.equal(settings.Values.THUMBNAIL_DISPATCH_TOKEN, '');
});

// 저장 흐름: Cosmos 컨테이너만 메모리로 바꾸고 실제 컨트롤러와 서비스를 쓴다.
function createMemoryContainer(posts = []) {
  const docs = new Map(posts.map((post) => [post.id, { ...post }]));
  return {
    docs,
    items: {
      query(spec) {
        const params = Object.fromEntries((spec.parameters || []).map((param) => [param.name, param.value]));
        return {
          async fetchAll() {
            if (spec.query.includes('p.id = @id')) {
              const doc = docs.get(params['@id']);
              return { resources: doc ? [doc] : [] };
            }
            if (spec.query.includes('p.slug = @slug')) {
              const found = [...docs.values()].filter((doc) => doc.slug === params['@slug'] && doc.id !== params['@excludeId']);
              return { resources: found.map((doc) => ({ id: doc.id })) };
            }
            return { resources: [] };
          }
        };
      },
      async create(doc) {
        docs.set(doc.id, { ...doc });
        return { resource: { ...doc } };
      }
    },
    item(id) {
      return {
        async replace(doc) {
          docs.set(id, { ...doc });
          return { resource: { ...doc } };
        }
      };
    }
  };
}

function loadControllerWith(container) {
  const cosmosPath = require.resolve('../src/services/cosmosClient');
  const stub = new Module(cosmosPath, module);
  stub.filename = cosmosPath;
  stub.loaded = true;
  stub.exports = { getPostsContainer: () => container, getAssetsContainer: () => container };
  require.cache[cosmosPath] = stub;
  delete require.cache[require.resolve('../src/controllers/adminController')];
  return require('../src/controllers/adminController');
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function withDispatchFetch(t, impl) {
  const calls = [];
  const original = globalThis.fetch;
  const previousToken = process.env.THUMBNAIL_DISPATCH_TOKEN;
  process.env.THUMBNAIL_DISPATCH_TOKEN = 'secret-token';
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return impl ? impl() : { ok: true, status: 204, text: async () => '' };
  };
  t.after(() => {
    globalThis.fetch = original;
    if (previousToken === undefined) delete process.env.THUMBNAIL_DISPATCH_TOKEN;
    else process.env.THUMBNAIL_DISPATCH_TOKEN = previousToken;
  });
  return calls;
}

const newPostBody = (status) => ({
  title: 'Copilot 수업 활용',
  category: 'copilot',
  contentMarkdown: '<p>본문</p>',
  tags: [],
  status
});

test('createPost requests a thumbnail when the post is saved as published', async (t) => {
  const calls = withDispatchFetch(t);
  const controller = loadControllerWith(createMemoryContainer());
  const res = createResponse();

  await controller.createPost({ correlationId: 'test', body: newPostBody('published') }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.inputs.post, `copilot/${res.body.slug}`);
});

test('createPost does not request a thumbnail for posts saved as draft', async (t) => {
  const calls = withDispatchFetch(t);
  const controller = loadControllerWith(createMemoryContainer());
  const res = createResponse();

  await controller.createPost({ correlationId: 'test', body: newPostBody('draft') }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(calls.length, 0);
});

test('updatePost requests a thumbnail when a draft is published and when a published post is edited', async (t) => {
  const calls = withDispatchFetch(t);
  const container = createMemoryContainer([{
    id: 'p1', partitionKey: 'm365', documentType: 'post', slug: 'existing-post', category: 'm365',
    title: '기존 글', excerpt: '', contentMarkdown: '<p>본문</p>', tags: ['word'], status: 'draft', publishedAt: null
  }]);
  const controller = loadControllerWith(container);

  const publish = createResponse();
  await controller.updatePost({ correlationId: 'test', params: { id: 'p1' }, body: { status: 'published' } }, publish);
  const edit = createResponse();
  await controller.updatePost({ correlationId: 'test', params: { id: 'p1' }, body: { contentMarkdown: '<p>고친 본문</p>' } }, edit);
  const archive = createResponse();
  await controller.updatePost({ correlationId: 'test', params: { id: 'p1' }, body: { status: 'draft' } }, archive);

  assert.deepEqual([publish.statusCode, edit.statusCode, archive.statusCode], [200, 200, 200]);
  assert.deepEqual(calls.map((call) => call.body.inputs.post), ['m365/existing-post', 'm365/existing-post']);
});

test('saving still succeeds when the thumbnail request fails', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const calls = withDispatchFetch(t, () => { throw new Error('GitHub is down'); });
  const container = createMemoryContainer();
  const controller = loadControllerWith(container);
  const res = createResponse();

  await controller.createPost({ correlationId: 'test', body: newPostBody('published') }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.status, 'published');
  assert.equal(container.docs.size, 1);
  assert.equal(calls.length, 1);
});
