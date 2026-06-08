const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildActivityVideoSeedDocs,
  parseArgs,
  seedActivityVideos,
} = require('../scripts/seed-activity-videos');

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

test('parseArgs accepts source path forms', () => {
  assert.deepEqual(parseArgs(['--dry-run', '--source=/tmp/activity.json']), {
    dryRun: true,
    force: false,
    sourcePath: '/tmp/activity.json',
  });

  assert.deepEqual(parseArgs(['--source', '/tmp/activity.json', '--force']), {
    dryRun: false,
    force: true,
    sourcePath: '/tmp/activity.json',
  });
});

test('parseArgs rejects missing source path', () => {
  assert.throws(() => parseArgs(['--source']), /--source requires a file path/);
  assert.throws(() => parseArgs(['--source=']), /--source requires a file path/);
});

test('seedActivityVideos dry-run reads custom source without Cosmos config', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'activity-videos-'));
  const sourcePath = path.join(tempDir, 'activityVideos.json');
  fs.writeFileSync(sourcePath, JSON.stringify([{
    videoId: 'SfK1hajr5qY',
    title: 'Title',
    channel: 'Microsoft Korea',
    category: '행사',
    year: '2026',
    description: 'Desc',
  }]));

  const result = await seedActivityVideos({ dryRun: true, sourcePath });

  assert.equal(result.planned, 1);
  assert.equal(result.created, 0);
  assert.equal(result.updated, 0);
  assert.equal(result.skipped, 0);
});
