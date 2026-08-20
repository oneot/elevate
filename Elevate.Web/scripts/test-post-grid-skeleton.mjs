import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '../src/components/posts/PostGrid.jsx'), 'utf8');
const layoutSource = readFileSync(join(__dirname, '../src/components/posts/PostListLayout.jsx'), 'utf8');
const postListSource = readFileSync(join(__dirname, '../src/pages/PostList.jsx'), 'utf8');
const updateSource = readFileSync(join(__dirname, '../src/pages/Microsoft365Update.jsx'), 'utf8');
const programSource = readFileSync(join(__dirname, '../src/pages/ProgramNews.jsx'), 'utf8');

assert.match(source, /export const POST_GRID_SKELETON_COUNT = 8;/);
assert.match(layoutSource, /skeletonCount/);
assert.match(layoutSource, /<PostGridSkeleton count=\{skeletonCount\} \/>/);
assert.match(postListSource, /skeletonCount=\{PAGE_SIZE\}/);
assert.match(updateSource, /skeletonCount=\{POST_LIST_PAGE_SIZE\}/);
assert.match(programSource, /skeletonCount=\{POST_LIST_PAGE_SIZE\}/);
