import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '../src/services/webVitals.js'), 'utf8');

assert.match(source, /window\.__elevateInpMeasurementStarted/);
assert.match(source, /window\.__elevateInpMeasurementStarted = true/);
