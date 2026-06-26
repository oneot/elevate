import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '../src/services/chunkLoadRecovery.js'), 'utf8');
const mainSource = readFileSync(join(__dirname, '../src/main.jsx'), 'utf8');

assert.match(source, /Failed to fetch dynamically imported module/);
assert.match(source, /Importing a module script failed/);
assert.match(source, /chunk-recovery-attempted/);
assert.match(source, /sessionStorage\.getItem/);
assert.match(source, /sessionStorage\.setItem/);
assert.match(source, /window\.location\.reload\(\)/);
assert.match(source, /window\.addEventListener\('error'/);
assert.match(source, /window\.addEventListener\('unhandledrejection'/);
assert.match(source, /trackClientDiagnostic\('chunk_load_failed'/);
assert.match(mainSource, /startChunkLoadRecovery\(\)/);
