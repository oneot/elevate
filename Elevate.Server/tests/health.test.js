const test = require('node:test');
const assert = require('node:assert/strict');

const { healthHandler } = require('../src/functions/health');

test('GET /api/health returns healthy status and correlation id', async () => {
  const response = await healthHandler(
    {
      headers: new Headers(),
      method: 'GET'
    },
    { log: console }
  );
  const body = response.jsonBody;

  assert.equal(response.status, 200);
  assert.equal(body.status, 'healthy');
  assert.equal(body.version, '1.0.0');
  assert.ok(typeof body.correlationId === 'string' && body.correlationId.length > 0);
  assert.equal(response.headers['x-correlation-id'], body.correlationId);
});
