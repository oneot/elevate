const test = require('node:test');
const assert = require('node:assert/strict');
const { createControllerHandler } = require('../src/functions/shared/httpHandler');
const { parsePositiveInt } = require('../src/utils/http');

test('rejects malformed JSON before calling the controller and preserves correlation ID', async () => {
  let called = false;
  const handler = createControllerHandler(() => { called = true; });
  const request = new Request('https://api.example.test/posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-correlation-id': 'request-1' },
    body: '{"title":',
  });
  const response = await handler(request, { log: console });
  assert.equal(called, false);
  assert.equal(response.status, 400);
  assert.equal(response.jsonBody.code, 'BadRequest');
  assert.equal(response.jsonBody.correlationId, 'request-1');
  assert.equal(response.headers['x-correlation-id'], 'request-1');
});

test('authenticates protected writes before attempting to parse their body', async () => {
  let called = false;
  const handler = createControllerHandler(() => { called = true; }, { requireAdminAuth: true });
  const response = await handler(new Request('https://api.example.test/posts', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
  }), { log: console });
  assert.equal(called, false);
  assert.equal(response.status, 401);
  assert.equal(response.jsonBody.code, 'Unauthorized');
});

test('preserves valid JSON bodies and 204 responses', async () => {
  const handler = createControllerHandler((req, res) => {
    assert.deepEqual(req.body, { title: 'Original title', status: 'draft' });
    return res.status(204).send();
  });
  const response = await handler(new Request('https://api.example.test/posts', {
    method: 'PUT',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ title: 'Original title', status: 'draft' }),
  }), { log: console });
  assert.equal(response.status, 204);
  assert.equal(response.body, undefined);
  assert.equal(response.jsonBody, undefined);
});

test('preserves bodyless DELETE requests even when the client sends a JSON content type', async () => {
  let called = false;
  const handler = createControllerHandler((req, res) => {
    called = true;
    assert.equal(req.body, null);
    return res.status(204).send();
  });
  const response = await handler(new Request('https://api.example.test/posts/post-1', {
    method: 'DELETE', headers: { 'content-type': 'application/json' },
  }), { log: console });
  assert.equal(called, true);
  assert.equal(response.status, 204);
});

test('logs unexpected body-read failures through the Azure Functions context', async () => {
  const failure = new TypeError('Body stream failed');
  const errors = [];
  let called = false;
  const handler = createControllerHandler(() => { called = true; });
  const response = await handler({
    method: 'POST',
    headers: new Headers({ 'content-type': 'application/json' }),
    text: async () => { throw failure; },
  }, { error: (...args) => errors.push(args) });
  assert.equal(called, false);
  assert.equal(response.status, 500);
  assert.equal(response.jsonBody.code, 'InternalServerError');
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1], failure);
});

test('integer query parsing retains defaults and valid integer boundaries', () => {
  for (const value of [undefined, null, '']) assert.equal(parsePositiveInt(value, 20, 1, 100), 20);
  for (const value of [1, '1', ' 20 ', '001', 100, '100']) {
    assert.equal(parsePositiveInt(value, 20, 1, 100), Number(value));
  }
});

test('integer query parsing rejects partial numbers, coercions and unsafe integers', () => {
  for (const value of ['1.5', '20posts', '1e2', '0x10', '+1', ' ', 'NaN', 1.5, NaN, Infinity, [], ['2'], true, {}, 0, 101, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(parsePositiveInt(value, 20, 1, 100), null, String(value));
  }
});
