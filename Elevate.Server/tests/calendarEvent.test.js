const test = require('node:test');
const assert = require('node:assert/strict');

let lastQuerySpec = null;
let lastCreatedDoc = null;
let mockQueryResources = [];
let querySpecs = [];

// cosmosClient 모킹 — require.cache 국소 스텁 (전역 Module._load 패치 없음)
const mockContainer = {
  items: {
    query: (querySpec) => {
      lastQuerySpec = querySpec;
      querySpecs.push(querySpec);
      return {
        fetchAll: async () => {
          const [, offset, limit] = querySpec.query.match(/OFFSET (\d+) LIMIT (\d+)/) || [];
          if (offset !== undefined && limit !== undefined) {
            return { resources: mockQueryResources.slice(Number(offset), Number(offset) + Number(limit)) };
          }
          return { resources: mockQueryResources };
        },
      };
    },
    create: async (doc) => {
      lastCreatedDoc = doc;
      return { resource: doc };
    },
    upsert: async (doc) => ({ resource: doc }),
  },
  item: (id, pk) => ({
    read: async () => ({ resource: { id, type: pk, title: 'Test', eventDates: null, eventLocation: null, eventTarget: null, linkedPostId: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' } }),
    delete: async () => ({}),
  }),
};

test.beforeEach(() => {
  lastQuerySpec = null;
  lastCreatedDoc = null;
  mockQueryResources = [];
  querySpecs = [];
});

const cosmosClientPath = require.resolve('../src/services/cosmosClient');
const ctrlPath = require.resolve('../src/controllers/calendarEventController');

// cosmosClient를 mock으로 캐시에 주입한 뒤 controller를 로드
require.cache[cosmosClientPath] = {
  id: cosmosClientPath,
  filename: cosmosClientPath,
  loaded: true,
  exports: { getCalendarEventsContainer: () => mockContainer },
};
delete require.cache[ctrlPath];
const ctrl = require('../src/controllers/calendarEventController');

// 테스트 종료 후 캐시 정리
test.after(() => {
  delete require.cache[cosmosClientPath];
  delete require.cache[ctrlPath];
});

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

test('createCalendarEvent — 잘못된 eventDates 포맷이면 400', async () => {
  const req = { body: { title: '이벤트', eventDates: [{ start: 'not-a-date' }] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('createCalendarEvent — eventDates가 배열이 아니면 400', async () => {
  const req = { body: { title: '이벤트', eventDates: '2026-06-01' }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates must be an array');
});

test('createCalendarEvent — 존재하지 않는 날짜면 400', async () => {
  const req = { body: { title: '이벤트', eventDates: [{ start: '2026-99-99' }] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('createCalendarEvent — end < start이면 400', async () => {
  const req = { body: { title: '이벤트', eventDates: [{ start: '2026-06-05', end: '2026-06-01' }] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('createCalendarEvent — eventDates가 없으면 400', async () => {
  const req = { body: { title: '테스트 이벤트' }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates is required');
});

test('createCalendarEvent — 정상 생성 시 201', async () => {
  lastCreatedDoc = null;
  const req = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01', end: '2026-06-02' }] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 201);
  assert.equal(res.getBody().title, '테스트 이벤트');
  assert.equal(lastCreatedDoc.partitionKey, 'calendarEvent');
});

test('createCalendarEvent — 빈 eventDates 배열이면 400', async () => {
  const req = { body: { title: '테스트 이벤트', eventDates: [] }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates must contain at least one date');
});

test('createCalendarEvent — linkedPostId가 문자열/null이 아니면 400', async () => {
  const req = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], linkedPostId: {} }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'linkedPostId must be a string or null');
});

test('createCalendarEvent — linkedPostId는 trim하고 빈 문자열은 null로 저장', async () => {
  const req = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], linkedPostId: '  post-1  ' }, correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 201);
  assert.equal(res.getBody().linkedPostId, 'post-1');

  const emptyReq = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], linkedPostId: '   ' }, correlationId: 'x', params: {}, query: {} };
  const emptyRes = makeRes();
  await ctrl.createCalendarEvent(emptyReq, emptyRes);
  assert.equal(emptyRes.getStatus(), 201);
  assert.equal(emptyRes.getBody().linkedPostId, null);
});

test('createCalendarEvent — eventLocation/eventTarget이 문자열/null이 아니면 400', async () => {
  const locationReq = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], eventLocation: [] }, correlationId: 'x', params: {}, query: {} };
  const locationRes = makeRes();
  await ctrl.createCalendarEvent(locationReq, locationRes);
  assert.equal(locationRes.getStatus(), 400);
  assert.equal(locationRes.getBody().message, 'eventLocation must be a string or null');

  const targetReq = { body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], eventTarget: {} }, correlationId: 'x', params: {}, query: {} };
  const targetRes = makeRes();
  await ctrl.createCalendarEvent(targetReq, targetRes);
  assert.equal(targetRes.getStatus(), 400);
  assert.equal(targetRes.getBody().message, 'eventTarget must be a string or null');
});

test('createCalendarEvent — eventLocation/eventTarget은 trim하고 빈 문자열은 null로 저장', async () => {
  const req = {
    body: { title: '테스트 이벤트', eventDates: [{ start: '2026-06-01' }], eventLocation: '  서울  ', eventTarget: '   ' },
    correlationId: 'x',
    params: {},
    query: {},
  };
  const res = makeRes();
  await ctrl.createCalendarEvent(req, res);
  assert.equal(res.getStatus(), 201);
  assert.equal(res.getBody().eventLocation, '서울');
  assert.equal(res.getBody().eventTarget, null);
});

test('listCalendarEvents — items 배열 반환', async () => {
  const req = { correlationId: 'x', params: {}, query: {} };
  const res = makeRes();
  await ctrl.listCalendarEvents(req, res);
  assert.ok(Array.isArray(res.getBody().items));
});

test('listCalendarEvents — 잘못된 limit이면 400', async () => {
  const req = { correlationId: 'x', params: {}, query: { limit: '0' } };
  const res = makeRes();
  await ctrl.listCalendarEvents(req, res);
  assert.equal(res.getStatus(), 400);
});

test('listCalendarEvents — 잘못된 기간 필터이면 400', async () => {
  const req = { correlationId: 'x', params: {}, query: { start: '2026-99-99' } };
  const res = makeRes();
  await ctrl.listCalendarEvents(req, res);
  assert.equal(res.getStatus(), 400);
});

test('listCalendarEvents — 기간 필터는 응답 필터링에 사용하고 Cosmos query에는 limit만 반영', async () => {
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '500' },
  };
  const res = makeRes();
  await ctrl.listCalendarEvents(req, res);
  assert.equal(res.getStatus(), 200);
  assert.doesNotMatch(lastQuerySpec.query, /EXISTS/);
  assert.doesNotMatch(lastQuerySpec.query, /IS_DEFINED/);
  assert.match(lastQuerySpec.query, /LIMIT 500/);
  assert.deepEqual(
    lastQuerySpec.parameters.filter((p) => p.name === '@start' || p.name === '@end'),
    []
  );
});

test('listCalendarEvents — start/end 기간과 겹치는 이벤트만 반환', async () => {
  mockQueryResources = [
    {
      id: 'before',
      type: 'calendarEvent',
      title: 'Before',
      eventDates: [{ start: '2025-12-20', end: '2025-12-21' }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'inside',
      type: 'calendarEvent',
      title: 'Inside',
      eventDates: [{ start: '2026-06-01', end: '2026-06-01' }],
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'overlap',
      type: 'calendarEvent',
      title: 'Overlap',
      eventDates: [{ start: '2025-12-31', end: '2026-01-02' }],
      createdAt: '2026-01-03T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
    },
    {
      id: 'after',
      type: 'calendarEvent',
      title: 'After',
      eventDates: [{ start: '2027-01-01', end: '2027-01-01' }],
      createdAt: '2026-01-04T00:00:00.000Z',
      updatedAt: '2026-01-04T00:00:00.000Z',
    },
  ];
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '500' },
  };
  const res = makeRes();

  await ctrl.listCalendarEvents(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody().items.map((item) => item.id), ['inside', 'overlap']);
});

test('listCalendarEvents — 잘못된 end 값은 기간 겹침 비교에 사용하지 않는다', async () => {
  mockQueryResources = [
    {
      id: 'invalid-end',
      type: 'calendarEvent',
      title: 'Invalid End',
      eventDates: [{ start: '2025-12-20', end: 'not-a-date' }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '500' },
  };
  const res = makeRes();

  await ctrl.listCalendarEvents(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody().items, []);
});

test('listCalendarEvents — start/end 기간 필터는 Cosmos array EXISTS 쿼리를 만들지 않는다', async () => {
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '500' },
  };
  const res = makeRes();

  await ctrl.listCalendarEvents(req, res);

  assert.equal(res.getStatus(), 200);
  assert.doesNotMatch(lastQuerySpec.query, /EXISTS/);
  assert.doesNotMatch(lastQuerySpec.query, /IS_DEFINED/);
  assert.match(lastQuerySpec.query, /WHERE c\.type = @type/);
  assert.match(lastQuerySpec.query, /LIMIT 500/);
});

test('listCalendarEvents — 기간 필터가 있으면 limit을 채울 때까지 다음 페이지를 조회한다', async () => {
  mockQueryResources = [
    {
      id: 'newer-outside',
      type: 'calendarEvent',
      title: 'Newer Outside',
      eventDates: [{ start: '2027-01-01' }],
      createdAt: '2026-01-03T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
    },
    {
      id: 'older-inside',
      type: 'calendarEvent',
      title: 'Older Inside',
      eventDates: [{ start: '2026-06-01' }],
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'oldest-inside',
      type: 'calendarEvent',
      title: 'Oldest Inside',
      eventDates: [{ start: '2026-07-01' }],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '2' },
  };
  const res = makeRes();

  await ctrl.listCalendarEvents(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody().items.map((item) => item.id), ['older-inside', 'oldest-inside']);
  assert.deepEqual(querySpecs.map((querySpec) => querySpec.query.match(/OFFSET (\d+) LIMIT (\d+)/).slice(1)), [
    ['0', '2'],
    ['2', '2'],
  ]);
});

test('listCalendarEvents — 기간 필터가 있으면 최대 스캔 문서 수에서 조회를 중단한다', async () => {
  mockQueryResources = Array.from({ length: 5500 }, (_, index) => ({
    id: `outside-${index}`,
    type: 'calendarEvent',
    title: `Outside ${index}`,
    eventDates: [{ start: '2027-01-01' }],
    createdAt: `2026-01-01T00:00:${String(index % 60).padStart(2, '0')}.000Z`,
    updatedAt: `2026-01-01T00:00:${String(index % 60).padStart(2, '0')}.000Z`,
  }));
  const req = {
    correlationId: 'x',
    params: {},
    query: { start: '2026-01-01', end: '2026-12-31', limit: '500' },
  };
  const res = makeRes();

  await ctrl.listCalendarEvents(req, res);

  assert.equal(res.getStatus(), 200);
  assert.deepEqual(res.getBody().items, []);
  assert.equal(querySpecs.length, 10);
  assert.equal(querySpecs.at(-1).query.match(/OFFSET (\d+) LIMIT (\d+)/)[1], '4500');
});

test('updateCalendarEvent — body 없으면 400', async () => {
  const req = { body: null, correlationId: 'x', params: { id: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('updateCalendarEvent — body가 객체가 아니면 400', async () => {
  const req = { body: [], correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('updateCalendarEvent — 잘못된 eventDates면 400', async () => {
  const req = { body: { eventDates: [{ start: '2026-06-05', end: '2026-06-01' }] }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('updateCalendarEvent — eventDates가 null이면 400', async () => {
  const req = { body: { eventDates: null }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates must be an array');
});

test('updateCalendarEvent — eventDates가 배열이 아니면 400', async () => {
  const req = { body: { eventDates: '2026-06-01' }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates must be an array');
});

test('updateCalendarEvent — 빈 eventDates 배열이면 400', async () => {
  const req = { body: { eventDates: [] }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
  assert.equal(res.getBody().message, 'eventDates must contain at least one date');
});

test('updateCalendarEvent — linkedPostId가 문자열/null이 아니면 400', async () => {
  const req = { body: { linkedPostId: [] }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const res = makeRes();
  await ctrl.updateCalendarEvent(req, res);
  assert.equal(res.getStatus(), 400);
});

test('updateCalendarEvent — eventLocation/eventTarget이 문자열/null이 아니면 400', async () => {
  const locationReq = { body: { eventLocation: {} }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const locationRes = makeRes();
  await ctrl.updateCalendarEvent(locationReq, locationRes);
  assert.equal(locationRes.getStatus(), 400);

  const targetReq = { body: { eventTarget: [] }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
  const targetRes = makeRes();
  await ctrl.updateCalendarEvent(targetReq, targetRes);
  assert.equal(targetRes.getStatus(), 400);
});

test('updateCalendarEvent — 정상 업데이트 시 200', async () => {
  const req = { body: { title: '수정된 이벤트' }, correlationId: 'x', params: { eventId: 'abc' }, query: {} };
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
