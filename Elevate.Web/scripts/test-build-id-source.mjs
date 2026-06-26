import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viteSource = readFileSync(join(__dirname, '../vite.config.js'), 'utf8');
const indexSource = readFileSync(join(__dirname, '../index.html'), 'utf8');
const mainSource = readFileSync(join(__dirname, '../src/main.jsx'), 'utf8');
const claritySource = readFileSync(join(__dirname, '../src/services/clarity.js'), 'utf8');
const boundarySource = readFileSync(join(__dirname, '../src/components/common/ErrorBoundary.jsx'), 'utf8');

assert.match(viteSource, /VITE_BUILD_ID/);
assert.match(viteSource, /GITHUB_SHA/);
assert.match(viteSource, /__ELEVATE_BUILD_ID__/);
assert.match(viteSource, /transformIndexHtml/);
assert.match(indexSource, /window\.__BUILD_ID__ = "__ELEVATE_BUILD_ID__"/);
assert.match(mainSource, /setClarityTag\('build_id'/);
assert.match(claritySource, /trackClientDiagnostic/);
assert.match(boundarySource, /window\.__BUILD_ID__/);
assert.match(boundarySource, /trackClientDiagnostic\('render_error'/);
