const test = require('node:test');
const assert = require('node:assert/strict');

// cosmosClient 모킹
const mockContainer = {
  items: {
    query: () => ({ fetchAll: async () => ({ resources: [] }) }),
    create: async (doc) => ({ resource: doc }),
    upsert: async (doc) => ({ resource: doc }),
  },
  item: (id, pk) => ({
    read: async () => ({ resource: { id, type: pk, title: 'Test', eventDates: null, eventLocation: null, eventTarget: null, linkedPostId: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' } }),
    delete: async () => ({}),
  }),
};

// 모듈 캐시를 우회해 cosmosClient를 교체한다
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.includes('cosmosClient')) {
    return { getCalendarEventsContainer: () => mockContainer };
  }
  return originalLoad.call(this, request, parent, isMain);
};

// 테스트 종료 후 Module._load 복구
test.after(() => {
  Module._load = originalLoad;
});

const ctrl = require('../src/controllers/calendarEventController');

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

test('createCalendarEvent — title 없으면 400', async () => {
  const req = { body: {}, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('createCalendarEvent — 정상 생성 시 201', async () => {
  const req = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01', end: '2026-06-02' }] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 201);
  assert.equal(res.getBody().title, '테스트 이벤트');
});

test('listCalendarEvents — items 배열 반환', async () => {
  const req = { correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.listCalendarEvents(req, res);
  assert.ok(Array.isArray(res.getBody().items));
});

test('updateCalendarEvent — body 없으면 400', async () => {
  const req = { body: null, correlationId: 'x', params: { id: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('updateCalendarEvent — 정상 업데이트 시 200', async () => {
  const req = { body: { title: '수정된 이벤트' }, correlationId: 'x', params: { id: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 200);
});

test('deleteCalendarEvent — 정상 삭제 시 204', async () => {
  const req = { correlationId: 'x', params: { id: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.deleteCalendarEvent(req, res);
  assert.equal(res.getStatus(), 204);
});
