const test = require('node:test');
const assert = require('node:assert/strict');

const { adminAnalyticsSummaryHandler } = require('../src/functions/adminAnalyticsSummary');
const { adminCalendarEventDetailHandler } = require('../src/functions/adminCalendarEventDetail');
const { adminCalendarEventsListHandler } = require('../src/functions/adminCalendarEventsList');
const { adminActivityVideosListHandler } = require('../src/functions/adminActivityVideosList');
const { adminActivityVideoCreateHandler } = require('../src/functions/adminActivityVideoCreate');
const { adminActivityVideoDeleteHandler } = require('../src/functions/adminActivityVideoDelete');
const { adminPostsListHandler } = require('../src/functions/adminPostsList');

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

test('GET /api/admin/posts returns 401 without bearer token', async () => {
  const response = await adminPostsListHandler(
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

test('GET /api/admin/calendar-events returns 401 without bearer token', async () => {
  const response = await adminCalendarEventsListHandler(
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

test('GET /api/admin/calendar-events/{eventId} returns 401 without bearer token', async () => {
  const response = await adminCalendarEventDetailHandler(
    {
      headers: new Headers(),
      method: 'GET',
      params: { eventId: 'event-1' },
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

test('GET /api/admin/activity-videos returns 401 without bearer token', async () => {
  const response = await adminActivityVideosListHandler({
    headers: new Headers(),
    method: 'GET',
    params: {},
    query: new URLSearchParams(),
  }, { log: console });

  assert.equal(response.status, 401);
  assert.equal(response.jsonBody.code, 'Unauthorized');
});

test('POST /api/admin/activity-videos returns 401 without bearer token', async () => {
  const response = await adminActivityVideoCreateHandler({
    headers: new Headers(),
    method: 'POST',
    params: {},
    query: new URLSearchParams(),
    json: async () => ({ videoId: 'SfK1hajr5qY' }),
  }, { log: console });

  assert.equal(response.status, 401);
  assert.equal(response.jsonBody.code, 'Unauthorized');
});

test('DELETE /api/admin/activity-videos/{activityVideoId} returns 401 without bearer token', async () => {
  const response = await adminActivityVideoDeleteHandler({
    headers: new Headers(),
    method: 'DELETE',
    params: { activityVideoId: 'video-1' },
    query: new URLSearchParams(),
  }, { log: console });

  assert.equal(response.status, 401);
  assert.equal(response.jsonBody.code, 'Unauthorized');
});
