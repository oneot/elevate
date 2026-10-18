import { execFile } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from 'vitest';

const exec = promisify(execFile);
const script = fileURLToPath(new URL('../scripts/generate-seo-routes.mjs', import.meta.url));
let server;
let baseUrl;
let workdir;
let respond;
let requestedPages;

beforeAll(async () => {
  server = createServer((req, res) => respond(req, res));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/public`;
});

afterAll(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), 'elevate-seo-'));
  mkdirSync(join(workdir, 'dist'));
  writeFileSync(join(workdir, 'dist/index.html'), '<html><head><title>Elevate</title></head><body><div id="root"></div><script src="/assets/app.js"></script></body></html>');
  requestedPages = [];
  respond = (req, res) => {
    const page = new URL(req.url, baseUrl).searchParams.get('page');
    requestedPages.push(page);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      items: [{
        slug: `fixture-${page}`, category: 'copilot', title: `Fixture ${page}`,
        excerpt: 'Summary only', contentMarkdown: '<p>Do not snapshot this body</p>',
      }],
      totalPages: 2,
    }));
  };
});

afterEach(() => rmSync(workdir, { recursive: true, force: true }));

function generate({ required = true, api = baseUrl } = {}) {
  return exec(process.execPath, [script], {
    cwd: workdir,
    env: { ...process.env, VITE_API_BASE_URL: api, REQUIRE_API_ROUTES: String(required) },
    timeout: 5000,
  });
}

it('generates existing SEO route shells for every API page without copying article bodies', async () => {
  await generate();
  expect(requestedPages).toEqual(['1', '2']);
  const html = readFileSync(join(workdir, 'dist/copilot/fixture-2/index.html'), 'utf8');
  expect(html).toContain('Fixture 2');
  expect(html).toContain('<div id="root"></div>');
  expect(html).toContain('/assets/app.js');
  expect(html).not.toContain('Do not snapshot this body');
  expect(readFileSync(join(workdir, 'dist/copilot/fixture-2.html'), 'utf8')).toBe(html);
});

it('fails a required deployment build when the public API cannot supply route metadata', async () => {
  respond = (_req, res) => { res.statusCode = 503; res.end('Unavailable'); };
  await expect(generate()).rejects.toMatchObject({ code: 1 });
});

it.each([
  { items: null, totalPages: 1 },
  { items: [], totalPages: '2' },
  { items: [], totalPages: 21 },
])('rejects malformed or truncated required pagination: %s', async (body) => {
  respond = (_req, res) => res.end(JSON.stringify(body));
  await expect(generate()).rejects.toMatchObject({ code: 1 });
});

it('keeps optional offline builds available without contacting an API', async () => {
  await generate({ required: false, api: '' });
  expect(requestedPages).toHaveLength(0);
  expect(readFileSync(join(workdir, 'dist/all/index.html'), 'utf8')).toContain('ALL Posts');
});

it('still reports optional API failures while generating the static route shells', async () => {
  respond = (_req, res) => { res.statusCode = 500; res.end('Unavailable'); };
  const { stderr } = await generate({ required: false });
  expect(stderr).toContain('Skipping post detail routes');
  expect(readFileSync(join(workdir, 'dist/all/index.html'), 'utf8')).toContain('ALL Posts');
});
