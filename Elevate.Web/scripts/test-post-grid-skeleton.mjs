import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '../src/components/posts/PostGrid.jsx'), 'utf8');

assert.match(source, /export const POST_GRID_SKELETON_COUNT = 8;/);
