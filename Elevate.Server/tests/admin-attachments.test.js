const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../src/controllers/adminController');

test('normalizeDraftSessionId accepts generated draft ids', () => {
  assert.equal(
    _test.normalizeDraftSessionId('draft-123e4567-e89b-12d3-a456-426614174000'),
    'draft-123e4567-e89b-12d3-a456-426614174000'
  );
});

test('normalizeDraftSessionId rejects unsafe or empty values', () => {
  assert.equal(_test.normalizeDraftSessionId(''), null);
  assert.equal(_test.normalizeDraftSessionId(null), null);
  assert.equal(_test.normalizeDraftSessionId('../draft-123'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-abc<script>'), null);
  assert.equal(_test.normalizeDraftSessionId('draft-' + 'a'.repeat(90)), null);
});
