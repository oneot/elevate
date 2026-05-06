/**
 * migrate-update-posts.js
 * Elevate.Web/posts/update/*.md → Cosmos DB 마이그레이션
 *
 * 이전 이력: 41개 마크다운 파일 이관 완료
 * 현재: 신규 3개 (26-04-06, 26-04-13, 26-04-20) 추가 마이그레이션용
 *
 * 실행:
 *   node migrate-update-posts.js            # dry-run
 *   node migrate-update-posts.js --apply    # 실제 업로드
 *   node migrate-update-posts.js --apply --allow-update  # 덮어쓰기
 *
 * 인증: Azure CLI (az account get-access-token) → type=aad&ver=1.0&sig=<token>
 *       (COSMOS_KEY 방식 미사용 - disableLocalAuth: true)
 * 의존성: gray-matter, marked (migration/node_modules), built-in https/crypto
 */
'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const { execSync } = require('child_process');

const NODE_MODULES = path.join(__dirname, 'node_modules');
const matter = require(path.join(NODE_MODULES, 'gray-matter'));
const { marked } = require(path.join(NODE_MODULES, 'marked'));

// ─── .env 로드 ──────────────────────────────────────────────────────────────
function loadEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch (_) {}
}
loadEnv(path.join(__dirname, '.env'));

// ─── 설정 ───────────────────────────────────────────────────────────────────
const APPLY        = process.argv.includes('--apply');
const ALLOW_UPDATE = process.argv.includes('--allow-update');

const REPO_ROOT    = path.join(__dirname, '..');
const SOURCE_DIR   = path.join(REPO_ROOT, 'Elevate.Web', 'posts', 'update');
const EXPECTED_COUNT = 3;

const COSMOS_ENDPOINT       = (process.env.COSMOS_ENDPOINT || '').replace(/\/$/, '');
const COSMOS_DATABASE_NAME  = process.env.COSMOS_DATABASE_NAME || 'elevate';
const COSMOS_CONTAINER_NAME = process.env.COSMOS_CONTAINER_NAME || 'posts';

// ─── 유틸 ───────────────────────────────────────────────────────────────────
function uuidv4() { return crypto.randomUUID(); }
function log(msg)  { console.log(`[migrate-update-posts] ${msg}`); }
function warn(msg) { console.warn(`[migrate-update-posts] WARNING: ${msg}`); }

// ─── Azure CLI AAD 토큰 ─────────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = 0;

function getAadToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) return cachedToken;
  log('Azure CLI로 AAD 토큰 획득 중...');
  const result = execSync(
    'az account get-access-token --resource https://cosmos.azure.com --query "{token:accessToken,exp:expiresOn}" -o json',
    { encoding: 'utf-8' }
  );
  const parsed = JSON.parse(result.trim());
  cachedToken = parsed.token;
  tokenExpiry = parsed.exp ? new Date(parsed.exp).getTime() : now + 3500000;
  log(`토큰 획득 완료 (만료: ${new Date(tokenExpiry).toISOString()})`);
  return cachedToken;
}

/** Cosmos DB AAD 인증 헤더: type=aad&ver=1.0&sig=<token> (URL 인코딩) */
function buildAadAuthHeader(token) {
  return encodeURIComponent(`type=aad&ver=1.0&sig=${token}`);
}

// ─── Cosmos DB REST API ──────────────────────────────────────────────────────

function httpsRequest(options, body, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Authorization': buildAadAuthHeader(token),
      'x-ms-version':  '2018-12-31',
      'x-ms-date':     new Date().toUTCString(),
      ...options.extraHeaders,
      'Content-Length': body ? Buffer.byteLength(body, 'utf-8') : 0,
    };
    const req = https.request(
      { hostname: new URL(COSMOS_ENDPOINT).hostname, port: 443, ...options, headers },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch { parsed = data; }
          if (res.statusCode >= 400) {
            const msg = typeof parsed === 'object' ? JSON.stringify(parsed) : data;
            const err = new Error(`HTTP ${res.statusCode}: ${msg}`);
            err.statusCode = res.statusCode;
            return reject(err);
          }
          resolve(parsed);
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(body, 'utf-8');
    req.end();
  });
}

const BASE = `/dbs/${COSMOS_DATABASE_NAME}/colls/${COSMOS_CONTAINER_NAME}`;

async function cosmosQuery(query, parameters = []) {
  const body = JSON.stringify({ query, parameters });
  const token = getAadToken();
  const result = await httpsRequest({
    path:   `${BASE}/docs`,
    method: 'POST',
    extraHeaders: {
      'x-ms-documentdb-isquery': 'true',
      'x-ms-documentdb-query-enablecrosspartition': 'true',
      'Content-Type': 'application/query+json',
    },
  }, body, token);
  return result.Documents || [];
}

async function cosmosCreate(doc) {
  const body = JSON.stringify(doc);
  const token = getAadToken();
  return httpsRequest({
    path:   `${BASE}/docs`,
    method: 'POST',
    extraHeaders: {
      'x-ms-documentdb-partitionkey': JSON.stringify([doc.partitionKey]),
      'Content-Type': 'application/json',
    },
  }, body, token);
}

async function cosmosReplace(id, partitionKey, doc) {
  const body = JSON.stringify(doc);
  const token = getAadToken();
  return httpsRequest({
    path:   `${BASE}/docs/${id}`,
    method: 'PUT',
    extraHeaders: {
      'x-ms-documentdb-partitionkey': JSON.stringify([partitionKey]),
      'Content-Type': 'application/json',
    },
  }, body, token);
}

// ─── 마크다운 파싱 ──────────────────────────────────────────────────────────

function normalizeTag(tag) { return String(tag || '').trim().toLowerCase(); }

function resolveTags(data) {
  if (Array.isArray(data.tags)) return [...new Set(data.tags.map(normalizeTag).filter(Boolean))];
  if (typeof data.tags === 'string') return [...new Set(data.tags.split(',').map(normalizeTag).filter(Boolean))];
  if (typeof data.tag === 'string')  return [...new Set(data.tag.split(',').map(normalizeTag).filter(Boolean))];
  return [];
}

function toDeterministicIsoDate(value, sourcePath) {
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())).toISOString();
  const raw = String(value || '').trim();
  if (!raw) throw new Error(`Missing required date in ${sourcePath}`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T00:00:00.000Z`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date "${raw}" in ${sourcePath}`);
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())).toISOString();
}

function resolveThumbnail(data) {
  if (data.youtube) return { url: `https://img.youtube.com/vi/${String(data.youtube).trim()}/hqdefault.jpg` };
  if (data.image && /^https?:\/\//i.test(String(data.image))) return { url: String(data.image).trim() };
  return null;
}

function stripInlineMarkdown(text) {
  return String(text || '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createExcerpt(content) {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [], cur = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) { if (cur.length) { blocks.push(cur.join(' ')); cur.length = 0; } continue; }
    if (/^#{1,6}\s+/.test(t) || /^```/.test(t)) { if (cur.length) { blocks.push(cur.join(' ')); cur.length = 0; } continue; }
    const n = stripInlineMarkdown(t.replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^>\s+/, ''));
    if (n) cur.push(n);
  }
  if (cur.length) blocks.push(cur.join(' '));
  const e = (blocks.find(b => b.length >= 20) || blocks[0] || '').trim();
  return e.length > 180 ? `${e.slice(0, 177).trimEnd()}...` : e;
}

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const slug     = path.basename(filePath, path.extname(filePath)).trim();
  const title    = String(data.title || '').trim();
  const category = String(data.category || '').trim().toLowerCase();
  const tags     = resolveTags(data);

  if (!title)            throw new Error(`Missing required title in ${filePath}`);
  if (category !== 'update') throw new Error(`Expected category "update", got "${category}" in ${filePath}`);
  if (!slug)             throw new Error(`Cannot derive slug from ${filePath}`);
  if (tags.length === 0) throw new Error(`Missing required tags in ${filePath}`);

  const publishedAt     = toDeterministicIsoDate(data.date, filePath);
  const normalizedContent = String(content || '').trim();
  const contentMarkdown = marked(normalizedContent);
  const thumbnail       = resolveThumbnail(data);
  const excerpt         = String(data.excerpt || '').trim() || createExcerpt(normalizedContent);
  const youtube         = data.youtube ? String(data.youtube).trim() : null;
  const series          = data.series  ? String(data.series).trim()  : null;
  const seriesOrder     = data.seriesOrder != null ? Number(data.seriesOrder) : null;

  return { slug, category: 'update', title, excerpt, tags, youtube, thumbnail, series, seriesOrder, publishedAt, contentMarkdown };
}

// ─── Cosmos 조회 / 빌드 ─────────────────────────────────────────────────────

async function findExistingPost(slug) {
  const results = await cosmosQuery(
    `SELECT TOP 1 c.id, c.partitionKey, c.createdAt FROM c
     WHERE (NOT IS_DEFINED(c.documentType) OR c.documentType = "post")
       AND c.category = "update" AND c.slug = @slug`,
    [{ name: '@slug', value: slug }]
  );
  return results[0] || null;
}

function buildDocument(entry, existing) {
  return {
    ...(existing || {}),
    id:              existing?.id || uuidv4(),
    partitionKey:    'update',
    documentType:    'post',
    slug:            entry.slug,
    category:        'update',
    title:           entry.title,
    excerpt:         entry.excerpt,
    contentMarkdown: entry.contentMarkdown,
    tags:            entry.tags,
    series:          entry.series,
    seriesOrder:     entry.seriesOrder,
    thumbnail:       entry.thumbnail,
    youtube:         entry.youtube,
    status:          'published',
    publishedAt:     entry.publishedAt,
    updatedAt:       entry.publishedAt,
    createdAt:       existing?.createdAt || entry.publishedAt,
  };
}

// ─── 메인 ───────────────────────────────────────────────────────────────────
async function main() {
  log(APPLY ? '실제 마이그레이션을 시작합니다.' : 'DRY-RUN 모드 (--apply 없이는 DB에 쓰지 않음).');
  if (ALLOW_UPDATE) log('   --allow-update: 기존 게시글도 덮어씁니다.');

  if (!COSMOS_ENDPOINT) throw new Error('COSMOS_ENDPOINT 환경변수가 없습니다.');
  if (!fs.existsSync(SOURCE_DIR)) throw new Error(`소스 디렉터리 없음: ${SOURCE_DIR}`);

  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(SOURCE_DIR, f))
    .sort();

  log(`마크다운 파일 ${files.length}개 발견 (예상: ${EXPECTED_COUNT}개)`);
  if (files.length !== EXPECTED_COUNT)
    throw new Error(`파일 수 불일치: 예상 ${EXPECTED_COUNT}개, 발견 ${files.length}개`);

  log('\n--- 파싱 ---');
  const entries = [];
  for (const file of files) {
    try { entries.push(parseMarkdownFile(file)); }
    catch (err) { throw new Error(`파싱 실패 [${path.basename(file)}]: ${err.message}`); }
  }
  entries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
  log(`파싱 완료. 최신 5개:`);
  entries.slice(0, 5).forEach(e => log(`  - ${e.publishedAt.slice(0, 10)} | ${e.slug} | ${e.title}`));

  if (!APPLY) {
    log('\n✅ DRY-RUN 완료. 실제 업로드: node migrate-update-posts.js --apply');
    return;
  }

  log('\n--- Cosmos DB 업로드 ---');
  const summary = { created: 0, updated: 0, skipped: 0, failed: 0 };

  for (const entry of entries) {
    try {
      const existing = await findExistingPost(entry.slug);

      if (existing && !ALLOW_UPDATE) {
        summary.skipped++;
        log(`[skip]   ${entry.slug}`);
        continue;
      }

      const doc = buildDocument(entry, existing);

      if (existing) {
        await cosmosReplace(existing.id, existing.partitionKey || 'update', doc);
        summary.updated++;
        log(`[update] ${entry.slug}`);
      } else {
        await cosmosCreate(doc);
        summary.created++;
        log(`[create] ${entry.slug}`);
      }
    } catch (err) {
      summary.failed++;
      warn(`[fail] ${entry.slug}: ${err.message}`);
    }
  }

  log('\n✅ 마이그레이션 완료!');
  log(`   생성: ${summary.created}개`);
  log(`   업데이트: ${summary.updated}개`);
  log(`   건너뜀: ${summary.skipped}개`);
  log(`   실패: ${summary.failed}개`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch(err => {
  console.error('[migrate-update-posts] ERROR:', err.message || err);
  process.exit(1);
});
