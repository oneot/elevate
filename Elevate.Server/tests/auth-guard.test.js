const test = require('node:test');
const assert = require('node:assert/strict');

const { adminAnalyticsSummaryHandler } = require('../src/functions/adminAnalyticsSummary');

test('GET /api/admin/analytics/summary returns 401 without bearer token', async () => {
  const response = await adminAnalyticsSummaryHandler(
    {
      headers: new Headers(),
      method: 'GET',
      params: {},
      query: new URLSearchParams()
    },
    { log: console }
  );
  const body = response.jsonBody;

  assert.equal(response.status, 401);
  assert.equal(body.code, 'Unauthorized');
  assert.equal(body.message, 'Missing or invalid access token');
  assert.ok(typeof body.correlationId === 'string' && body.correlationId.length > 0);
});
