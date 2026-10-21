const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { SignJWT, generateKeyPair } = require('jose');

const {
  GITHUB_OIDC_ISSUER,
  authorizeAutomationRequest,
  automationClaimProblem,
  getAutomationConfig
} = require('../src/middleware/automationAuth');

const AUDIENCE = 'api://elevate-post-automation';
const claims = {
  repository: 'oneot/elevate',
  repository_id: '1125077519',
  ref: 'refs/heads/main',
  workflow_ref: 'oneot/elevate/.github/workflows/post-thumbnails.yml@refs/heads/main',
  run_id: '4242',
  sha: 'a'.repeat(40)
};

const keysPromise = generateKeyPair('RS256');

async function token(overrides = {}, { audience = AUDIENCE, issuer = GITHUB_OIDC_ISSUER, expiresIn = '5m', privateKey } = {}) {
  const keys = await keysPromise;
  return new SignJWT({ ...claims, ...overrides })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey || keys.privateKey);
}

const requestWith = (authorization) => ({ headers: new Map(authorization ? [['authorization', authorization]] : []) });

async function authorize(authorization, env = {}) {
  const { publicKey } = await keysPromise;
  return authorizeAutomationRequest(requestWith(authorization), { env, key: publicKey });
}

test('accepts an OIDC token from the Post thumbnails workflow on main', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const caller = await authorize(`Bearer ${await token()}`);

  assert.deepEqual(caller, { workflowRef: claims.workflow_ref, runId: '4242', sha: claims.sha });
});

test('rejects requests without a valid GitHub token', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const other = await generateKeyPair('RS256');
  const cases = [
    undefined,
    'Basic abc',
    `Bearer ${await token({}, { audience: 'api://someone-else' })}`,
    `Bearer ${await token({}, { issuer: 'https://login.microsoftonline.com/x/v2.0' })}`,
    `Bearer ${await token({}, { expiresIn: '-1m' })}`,
    `Bearer ${await token({}, { privateKey: other.privateKey })}`
  ];

  for (const authorization of cases) {
    await assert.rejects(authorize(authorization), (error) => error.status === 401 && error.code === 'Unauthorized', String(authorization).slice(0, 30));
  }
});

test('rejects GitHub tokens from another repository, branch or workflow', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const cases = [
    { repository: 'someone/elevate', workflow_ref: 'someone/elevate/.github/workflows/post-thumbnails.yml@refs/heads/main' },
    { repository_id: '1' },
    { ref: 'refs/heads/thumbnail/m365/x', workflow_ref: 'oneot/elevate/.github/workflows/post-thumbnails.yml@refs/heads/thumbnail/m365/x' },
    { ref: 'refs/heads/feature' },
    { ref: 'refs/pull/7/merge', workflow_ref: 'oneot/elevate/.github/workflows/post-thumbnails.yml@refs/pull/7/merge' },
    { workflow_ref: 'oneot/elevate/.github/workflows/web-checks.yml@refs/heads/main' }
  ];

  for (const overrides of cases) {
    await assert.rejects(authorize(`Bearer ${await token(overrides)}`), (error) => error.status === 403 && error.code === 'Forbidden', JSON.stringify(overrides));
  }
  assert.ok(warn.mock.calls.every((call) => !call.arguments.join(' ').includes('eyJ')), '토큰을 로그에 남기지 않는다');
});

test('reads the allowed repository and workflow from app settings', async () => {
  const env = { AUTOMATION_GITHUB_WORKFLOW: 'excerpts.yml', AUTOMATION_OIDC_AUDIENCE: 'api://custom' };
  const config = getAutomationConfig(env);
  assert.equal(config.workflow, 'excerpts.yml');
  assert.equal(config.audience, 'api://custom');
  assert.equal(automationClaimProblem({ ...claims, workflow_ref: 'oneot/elevate/.github/workflows/excerpts.yml@refs/heads/main' }, config), null);
  assert.equal(automationClaimProblem(claims, config), 'workflow_ref');
  assert.equal(automationClaimProblem(claims, getAutomationConfig({})), null);

  const caller = await authorize(`Bearer ${await token({ workflow_ref: 'oneot/elevate/.github/workflows/excerpts.yml@refs/heads/main' }, { audience: 'api://custom' })}`, env);
  assert.equal(caller.runId, '4242');
});

// 컨트롤러: Cosmos 컨테이너만 메모리로 바꾼다. ETag가 다르면 replace가 412를 던진다.
function memoryContainer(posts) {
  const docs = new Map(posts.map((post) => [post.id, { _etag: '"1"', ...post }]));
  let etag = 1;
  return {
    docs,
    items: {
      query(spec) {
        const id = spec.parameters[0].value;
        return { fetchAll: async () => ({ resources: docs.has(id) ? [{ ...docs.get(id) }] : [] }) };
      }
    },
    item(id) {
      return {
        async replace(doc, options) {
          if (options?.accessCondition && docs.get(id)._etag !== options.accessCondition.condition) {
            throw Object.assign(new Error('Precondition failed'), { code: 412 });
          }
          etag += 1;
          docs.set(id, { ...doc, _etag: `"${etag}"` });
          return { resource: { ...docs.get(id) } };
        }
      };
    }
  };
}

function loadController(container) {
  const cosmosPath = require.resolve('../src/services/cosmosClient');
  const stub = new Module(cosmosPath, module);
  stub.filename = cosmosPath;
  stub.loaded = true;
  stub.exports = { getPostsContainer: () => container };
  require.cache[cosmosPath] = stub;
  delete require.cache[require.resolve('../src/controllers/automationController')];
  return require('../src/controllers/automationController');
}

const response = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this; },
  json(payload) { this.body = payload; return this; }
});

const published = {
  id: 'p1', partitionKey: 'copilot', category: 'copilot', slug: 'class-agent', title: '학급 도우미 에이전트',
  excerpt: '', status: 'published', publishedAt: '2026-10-21T01:00:00.000Z', updatedAt: '2026-10-21T01:00:00.000Z'
};
const body = (overrides = {}) => ({ excerpt: '반복되는 학생 질문에 답하는 학급 도우미 에이전트를 만들고 공유합니다.', slug: 'class-agent', expectedUpdatedAt: published.updatedAt, ...overrides });
const call = async (controller, payload, id = 'p1') => {
  const res = response();
  await controller.updatePostExcerpt({ correlationId: 'test', params: { id }, body: payload, user: { runId: '4242' } }, res);
  return res;
};

test('writes the AI excerpt to a published post without marking it as edited', async () => {
  const container = memoryContainer([published]);
  const res = await call(loadController(container), body({ excerpt: '  반복되는 학생 질문에 답하는 학급 도우미 에이전트를 만들고 공유합니다. ' }));

  assert.equal(res.statusCode, 200);
  const saved = container.docs.get('p1');
  assert.equal(saved.excerpt, '반복되는 학생 질문에 답하는 학급 도우미 에이전트를 만들고 공유합니다.');
  assert.equal(saved.excerptSource, 'ai');
  assert.equal(saved.excerptRunId, '4242');
  assert.ok(Date.parse(saved.excerptGeneratedAt));
  assert.equal(saved.updatedAt, published.updatedAt, '사람이 고친 시각은 바꾸지 않는다');
  assert.equal(saved.title, published.title);
  assert.deepEqual(res.body, { id: 'p1', slug: 'class-agent', excerpt: saved.excerpt, excerptGeneratedAt: saved.excerptGeneratedAt, updatedAt: published.updatedAt });
});

test('skips posts that changed, are not published or do not match', async () => {
  const container = memoryContainer([published, { ...published, id: 'p2', slug: 'draft-post', status: 'draft' }]);
  const controller = loadController(container);

  assert.equal((await call(controller, body({ expectedUpdatedAt: '2026-10-21T00:59:00.000Z' }))).statusCode, 409);
  assert.equal((await call(controller, body({ slug: 'draft-post' }), 'p2')).statusCode, 409);
  assert.equal((await call(controller, body({ slug: 'other-slug' }))).statusCode, 404);
  assert.equal((await call(controller, body(), 'missing')).statusCode, 404);
  assert.equal(container.docs.get('p1').excerpt, '', '건너뛴 요청은 아무것도 바꾸지 않는다');
});

test('does not overwrite a save that lands between reading and writing', async () => {
  const container = memoryContainer([published]);
  const original = container.items.query.bind(container.items);
  container.items.query = (spec) => {
    const result = original(spec);
    return {
      async fetchAll() {
        const read = await result.fetchAll();
        container.docs.set('p1', { ...container.docs.get('p1'), title: '관리자가 방금 저장', _etag: '"99"' });
        return read;
      }
    };
  };
  const res = await call(loadController(container), body());

  assert.equal(res.statusCode, 409);
  assert.equal(container.docs.get('p1').title, '관리자가 방금 저장');
  assert.equal(container.docs.get('p1').excerpt, '');
});

test('accepts only one short line of plain text', async () => {
  const controller = loadController(memoryContainer([published]));
  for (const payload of [
    null,
    body({ excerpt: '' }),
    body({ excerpt: '   ' }),
    body({ excerpt: '첫 줄\n둘째 줄' }),
    body({ excerpt: '<b>굵게</b> 씁니다.' }),
    body({ excerpt: '가'.repeat(201) }),
    body({ slug: undefined }),
    body({ expectedUpdatedAt: undefined })
  ]) {
    assert.equal((await call(controller, payload)).statusCode, 400, JSON.stringify(payload));
  }
});

test('the excerpt endpoint is registered for PUT and refuses calls without a token', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const { functionDefinition, automationPostExcerptHandler } = require('../src/functions/automationPostExcerpt');
  assert.equal(functionDefinition.route, 'api/automation/posts/{id}/excerpt');
  assert.deepEqual(functionDefinition.methods, ['PUT']);
  const index = fs.readFileSync(path.join(__dirname, '..', 'src', 'functions', 'index.js'), 'utf8');
  assert.match(index, /require\('\.\/automationPostExcerpt'\)/);
  assert.match(index, /^\s+automationPostExcerpt\b/m);

  const response = await automationPostExcerptHandler({
    headers: new Map(),
    params: { id: 'p1' },
    query: new URLSearchParams(),
    text: async () => JSON.stringify(body())
  }, { log: () => {} });
  assert.equal(response.status, 401);
  assert.equal(response.jsonBody.code, 'Unauthorized');
});
