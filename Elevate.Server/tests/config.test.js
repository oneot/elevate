const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('local settings example documents the calendar events Cosmos container', () => {
  const settingsPath = path.join(__dirname, '..', 'local.settings.json.example');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  assert.equal(settings.Values.COSMOS_CALENDAR_EVENTS_CONTAINER_NAME, 'posts');
});

test('local settings example documents the activity videos Cosmos container', () => {
  const settingsPath = path.join(__dirname, '..', 'local.settings.json.example');
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  assert.equal(settings.Values.COSMOS_ACTIVITY_VIDEOS_CONTAINER_NAME, 'posts');
});

test('cosmos client exports getActivityVideosContainer', () => {
  const cosmos = require('../src/services/cosmosClient');

  assert.equal(typeof cosmos.getActivityVideosContainer, 'function');
});
