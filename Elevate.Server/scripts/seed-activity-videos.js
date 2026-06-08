'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PARTITION_KEY = 'activityVideo';
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const DEFAULT_SOURCE_PATH = path.join(
  __dirname,
  '..',
  '..',
  'Elevate.Web',
  'src',
  'data',
  'activityVideos.json'
);

function normalizeRequiredString(record, fieldName, index) {
  if (typeof record[fieldName] !== 'string' || !record[fieldName].trim()) {
    throw new Error(`Invalid activity video at index ${index}: ${fieldName} is required`);
  }
  return record[fieldName].trim();
}

function normalizeOptionalString(record, fieldName, index) {
  if (record[fieldName] === undefined || record[fieldName] === null) {
    return null;
  }
  if (typeof record[fieldName] !== 'string') {
    throw new Error(`Invalid activity video at index ${index}: ${fieldName} must be a string or null`);
  }
  return record[fieldName].trim() || null;
}

function buildActivityVideoSeedDocs(sourceVideos, now = new Date().toISOString()) {
  if (!Array.isArray(sourceVideos)) {
    throw new Error('Activity video source must be an array');
  }

  const seenVideoIds = new Set();

  return sourceVideos.map((record, index) => {
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(`Invalid activity video at index ${index}: record must be an object`);
    }

    const videoId = normalizeRequiredString(record, 'videoId', index);
    if (!YOUTUBE_ID_RE.test(videoId)) {
      throw new Error(`Invalid activity video at index ${index}: videoId must be an 11-character YouTube ID`);
    }
    if (seenVideoIds.has(videoId)) {
      throw new Error(`Duplicate videoId: ${videoId}`);
    }
    seenVideoIds.add(videoId);

    return {
      id: `activity-video-${videoId}`,
      type: PARTITION_KEY,
      partitionKey: PARTITION_KEY,
      videoId,
      title: normalizeRequiredString(record, 'title', index),
      channel: normalizeOptionalString(record, 'channel', index),
      category: normalizeRequiredString(record, 'category', index),
      year: normalizeRequiredString(record, 'year', index),
      description: normalizeOptionalString(record, 'description', index),
      sortOrder: (index + 1) * 10,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    };
  });
}

function loadSourceVideos(sourcePath = DEFAULT_SOURCE_PATH) {
  return JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
}

function isNotFound(error) {
  return error && (error.code === 404 || error.statusCode === 404);
}

async function seedActivityVideos({ force = false, dryRun = false } = {}) {
  const docs = buildActivityVideoSeedDocs(loadSourceVideos());

  if (dryRun) {
    console.log(`planned documents: ${docs.length}`);
    console.log('created: 0');
    console.log('updated: 0');
    console.log('skipped: 0');
    return { planned: docs.length, created: 0, updated: 0, skipped: 0 };
  }

  const { getActivityVideosContainer } = require('../src/services/cosmosClient');
  const container = getActivityVideosContainer();
  const counts = { planned: docs.length, created: 0, updated: 0, skipped: 0 };

  for (const doc of docs) {
    try {
      const { resource } = await container.item(doc.id, PARTITION_KEY).read();
      if (resource && !force) {
        counts.skipped += 1;
        continue;
      }
      await container.items.upsert(doc);
      counts.updated += 1;
    } catch (error) {
      if (!isNotFound(error)) {
        throw error;
      }
      await container.items.create(doc);
      counts.created += 1;
    }
  }

  console.log(`created: ${counts.created}`);
  console.log(`updated: ${counts.updated}`);
  console.log(`skipped: ${counts.skipped}`);

  return counts;
}

function parseArgs(argv) {
  const options = { dryRun: false, force: false };
  for (const arg of argv) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--force') {
      options.force = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await seedActivityVideos(options);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildActivityVideoSeedDocs,
  seedActivityVideos,
};
