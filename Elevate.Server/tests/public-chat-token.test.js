const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const util = require('node:util');

const { functionDefinition, publicChatTokenHandler } = require('../src/functions/publicChatToken');
const { requestDirectLineToken } = require('../src/services/directLineToken');

const SECRET = 'direct-line-secret-must-not-leak';
const GENERIC_MESSAGE = 'Chat is temporarily unavailable';
const LOG_METHODS = ['log', 'trace', 'debug', 'info', 'warn', 'error'];

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' }
});

// 핸들러는 process.env와 전역 fetch를 쓰므로 테스트마다 바꾸고 되돌린다. 콘솔과 함수 context 로그는 모두 모은다.
function setup(t, options) {
  const { respond } = options;
  const secret = 'secret' in options ? options.secret : SECRET;
  const previousSecret = process.env.DIRECT_LINE_SECRET;
  const originalFetch = globalThis.fetch;
  if (secret === undefined) delete process.env.DIRECT_LINE_SECRET;
  else process.env.DIRECT_LINE_SECRET = secret;

  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return respond(url, init);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (previousSecret === undefined) delete process.env.DIRECT_LINE_SECRET;
    else process.env.DIRECT_LINE_SECRET = previousSecret;
  });

  const logs = [];
  const record = (...args) => logs.push(util.format(...args));
  for (const method of LOG_METHODS) t.mock.method(console, method, record);
  const context = Object.fromEntries(LOG_METHODS.map((method) => [method, record]));

  const call = () => publicChatTokenHandler(
    new Request('https://api.example.test/api/public/chat-token', { headers: { 'x-correlation-id': 'req-1' } }),
    context
  );
  return { calls, logs, call };
}

function assertGenericFailure(response, status, code) {
  assert.equal(response.status, status);
  assert.deepEqual(response.jsonBody, { code, message: GENERIC_MESSAGE, correlationId: 'req-1' });
  assert.equal(response.headers['cache-control'], 'no-store');
}

function assertNothingLeaks(response, logs, ...hidden) {
  const visible = [JSON.stringify(response), ...logs].join('\n');
  for (const value of [SECRET, ...hidden]) {
    assert.equal(visible.includes(value), false, `"${value}" leaked into the response or logs`);
  }
}

test('registers GET /api/public/chat-token as an anonymous public route', (t) => {
  const { name, methods, authLevel, route } = functionDefinition;
  assert.deepEqual(
    { name, methods, authLevel, route },
    { name: 'publicChatToken', methods: ['GET'], authLevel: 'anonymous', route: 'api/public/chat-token' }
  );

  // 테스트에서는 @azure/functions가 함수 등록을 건너뛰며 경고를 남긴다.
  t.mock.method(console, 'warn', () => {});
  const { functionDefinitions } = require('../src/functions');
  assert.ok(functionDefinitions.includes(functionDefinition));
});

test('returns only the Direct Line token, uncached, and keeps the secret on the server', async (t) => {
  const { calls, logs, call } = setup(t, {
    respond: () => jsonResponse({ conversationId: 'conversation-1', token: 'direct-line-token', expires_in: 3600 })
  });

  const response = await call();

  assert.equal(response.status, 200);
  assert.deepEqual(response.jsonBody, { token: 'direct-line-token' });
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(response.headers['x-correlation-id'], 'req-1');

  assert.equal(calls.length, 1);
  const [{ url, init }] = calls;
  assert.equal(url, 'https://directline.botframework.com/v3/directline/tokens/generate');
  assert.equal(init.method, 'POST');
  assert.deepEqual(init.headers, { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' });
  assert.equal(init.body, undefined);
  assert.ok(init.signal instanceof AbortSignal);

  assert.deepEqual(logs, []);
  assertNothingLeaks(response, logs);
});

test('answers a generic 503 without calling Direct Line when the secret is not configured', async (t) => {
  for (const secret of [undefined, '', '   ']) {
    await t.test(`DIRECT_LINE_SECRET=${JSON.stringify(secret)}`, async (t) => {
      const { calls, logs, call } = setup(t, { secret, respond: () => assert.fail('Direct Line must not be called') });

      const response = await call();

      assertGenericFailure(response, 503, 'ServiceUnavailable');
      assert.equal(calls.length, 0);
      assert.deepEqual(logs, ['[publicChatToken] DIRECT_LINE_SECRET app setting is not set (correlationId: req-1)']);
    });
  }
});

test('hides Direct Line errors and logs only the status code', async (t) => {
  const upstream = new Response('{"error":{"code":"BadArgument","message":"Invalid token or secret"}}', { status: 403 });
  const { logs, call } = setup(t, { respond: () => upstream });

  const response = await call();

  assertGenericFailure(response, 502, 'BadGateway');
  assert.deepEqual(logs, ['[publicChatToken] Direct Line returned HTTP 403 (correlationId: req-1)']);
  assert.equal(upstream.bodyUsed, true, 'the unread error body is released');
  assertNothingLeaks(response, logs, 'BadArgument', 'Invalid token or secret');
});

test('hides network failures even when the error text is sensitive', async (t) => {
  const { logs, call } = setup(t, {
    respond: () => {
      throw new TypeError('fetch failed', { cause: new Error(`connect ECONNREFUSED (Authorization: Bearer ${SECRET})`) });
    }
  });

  const response = await call();

  assertGenericFailure(response, 502, 'BadGateway');
  assert.deepEqual(logs, ['[publicChatToken] Direct Line request failed before a response (correlationId: req-1)']);
  assertNothingLeaks(response, logs, 'ECONNREFUSED', 'fetch failed');
});

test('treats a Direct Line answer without a usable token as a failure', async (t) => {
  const answers = {
    'non-JSON body': () => new Response('<html>Upstream maintenance page</html>', { status: 200 }),
    'missing token': () => jsonResponse({ conversationId: 'conversation-1' }),
    'empty token': () => jsonResponse({ token: '  ' }),
    'non-string token': () => jsonResponse({ token: 42 })
  };

  for (const [label, respond] of Object.entries(answers)) {
    await t.test(label, async (t) => {
      const { logs, call } = setup(t, { respond });

      const response = await call();

      assertGenericFailure(response, 502, 'BadGateway');
      assert.deepEqual(logs, ['[publicChatToken] Direct Line returned HTTP 200 without a usable token (correlationId: req-1)']);
      assertNothingLeaks(response, logs, 'Upstream maintenance page', 'conversation-1');
    });
  }
});

test('answers a generic 504 when the Direct Line request times out', async (t) => {
  const { logs, call } = setup(t, {
    respond: () => {
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    }
  });

  const response = await call();

  assertGenericFailure(response, 504, 'GatewayTimeout');
  assert.deepEqual(logs, ['[publicChatToken] Direct Line request timed out (correlationId: req-1)']);
  assertNothingLeaks(response, logs, 'aborted');
});

test('requestDirectLineToken gives up on a silent or stalled Direct Line response', { timeout: 5000 }, async (t) => {
  const server = http.createServer((req, res) => {
    if (req.url === '/stalled-body') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.write('{"token":');
    }
    // '/silent'은 응답하지 않는다.
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const origin = `http://127.0.0.1:${server.address().port}`;

  for (const pathname of ['/silent', '/stalled-body']) {
    const result = await requestDirectLineToken({
      env: { DIRECT_LINE_SECRET: SECRET },
      fetchImpl: (url, init) => fetch(`${origin}${pathname}`, init),
      timeoutMs: 50
    });
    assert.deepEqual(result, { failure: 'timeout' }, pathname);
  }
});

test('requestDirectLineToken trims the app setting before using it', async () => {
  let authorization;
  const result = await requestDirectLineToken({
    env: { DIRECT_LINE_SECRET: `  ${SECRET}\n` },
    fetchImpl: async (url, init) => {
      authorization = init.headers.Authorization;
      return jsonResponse({ token: 'direct-line-token' });
    }
  });

  assert.deepEqual(result, { token: 'direct-line-token' });
  assert.equal(authorization, `Bearer ${SECRET}`);
});

test('local settings example leaves the Direct Line secret empty', () => {
  const settingsPath = path.join(__dirname, '..', 'local.settings.json.example');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  assert.equal(settings.Values.DIRECT_LINE_SECRET, '');
});
