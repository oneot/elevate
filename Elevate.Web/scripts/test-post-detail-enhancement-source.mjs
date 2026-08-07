import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, '../src/pages/PostDetail.jsx'), 'utf8');

assert.match(
  source,
  /const PostContent = memo\(function PostContent\(\{ html, navigate \}\)/,
);
assert.match(
  source,
  /\}, \[html, navigate\]\);/,
);
assert.match(source, /<PostContent html=\{preparedContentHtml\} navigate=\{navigate\} \/>/);