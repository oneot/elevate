const test = require('node:test');
const assert = require('node:assert/strict');
const { buildActivityVideoSeedDocs } = require('../scripts/seed-activity-videos');

test('buildActivityVideoSeedDocs maps static videos to published activityVideo docs', () => {
  const docs = buildActivityVideoSeedDocs([{
    id: '1',
    videoId: 'SfK1hajr5qY',
    title: 'Title',
    channel: 'Microsoft Korea',
    category: '행사',
    year: '2026',
    description: 'Desc',
  }], '2026-06-08T00:00:00.000Z');

  assert.equal(docs[0].id, 'activity-video-SfK1hajr5qY');
  assert.equal(docs[0].type, 'activityVideo');
  assert.equal(docs[0].partitionKey, 'activityVideo');
  assert.equal(docs[0].status, 'published');
  assert.equal(docs[0].sortOrder, 10);
});

test('buildActivityVideoSeedDocs rejects duplicate video IDs', () => {
  assert.throws(() => buildActivityVideoSeedDocs([
    { videoId: 'SfK1hajr5qY', title: 'A', category: '행사', year: '2026' },
    { videoId: 'SfK1hajr5qY', title: 'B', category: '행사', year: '2026' },
  ]), /Duplicate videoId/);
});
