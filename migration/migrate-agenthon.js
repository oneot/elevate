/**
 * migrate-agenthon.js
 * agenthon-interview.md 와 이미지를 Blob Storage + Cosmos DB로 마이그레이션
 *
 * 실행: node migrate-agenthon.js [--dry-run]
 */
'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// .env 직접 파싱 (dotenv v17 대화형 UI 우회)
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
  } catch (e) {
    // .env 없으면 무시 (환경변수 직접 설정 케이스)
  }
}
loadEnv(path.join(__dirname, '.env'));

const { v4: uuidv4 } = require('uuid');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { AzureCliCredential } = require('@azure/identity');

// ─── 설정 ──────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

const REPO_ROOT = path.join(__dirname, '..');
const MD_FILE = path.join(REPO_ROOT, 'Elevate.Web', 'src', 'content', 'agenthon', 'agenthon-interview.md');
const IMAGES_DIR = path.join(REPO_ROOT, 'Elevate.Web', 'public', 'images', 'agenthon');

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_DATABASE_NAME = process.env.COSMOS_DATABASE_NAME || 'elevate';
const COSMOS_CONTAINER_NAME = process.env.COSMOS_CONTAINER_NAME || 'posts';
const COSMOS_KEY = process.env.COSMOS_KEY;

const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_CONTAINER_NAME = process.env.STORAGE_CONTAINER_NAME || 'images';

// ─── 유틸 ──────────────────────────────────────────────────────────────────
function log(msg) { console.log(`[migrate-agenthon] ${msg}`); }
function warn(msg) { console.warn(`[migrate-agenthon] ⚠️  ${msg}`); }

function buildBlobPath() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const id = uuidv4().replace(/-/g, '');
  return `uploads/${yyyy}/${mm}/${id}`;
}

// Cosmos DB 클라이언트 초기화
function makeCosmosClient() {
  if (COSMOS_KEY) {
    return new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
  }
  return new CosmosClient({ endpoint: COSMOS_ENDPOINT, aadCredentials: new AzureCliCredential() });
}

// Blob Storage 클라이언트 초기화
function makeBlobClient() {
  return new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    new AzureCliCredential()
  );
}

// ─── 마이그레이션 로직 ──────────────────────────────────────────────────────

/**
 * 이미지 파일을 Blob Storage에 업로드하고 blob URL 반환
 * @returns {Map<string, string>}  로컬경로(e.g. /images/agenthon/1.jpg) → blob URL
 */
async function uploadImages(blobServiceClient) {
  const containerClient = blobServiceClient.getContainerClient(STORAGE_CONTAINER_NAME);
  const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));

  log(`이미지 ${imageFiles.length}개 발견: ${imageFiles.join(', ')}`);

  const urlMap = new Map();

  for (const file of imageFiles) {
    const localPath = path.join(IMAGES_DIR, file);
    const ext = path.extname(file).slice(1).toLowerCase();
    const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'png' ? 'image/png'
      : ext === 'gif' ? 'image/gif'
      : 'image/webp';

    const blobPath = `${buildBlobPath()}.${ext}`;
    const localKey = `/images/agenthon/${file}`;

    if (DRY_RUN) {
      const fakeBlobUrl = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${STORAGE_CONTAINER_NAME}/${blobPath}`;
      urlMap.set(localKey, fakeBlobUrl);
      log(`[DRY-RUN] 업로드 건너뜀: ${localKey} → ${fakeBlobUrl}`);
      continue;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
    const data = fs.readFileSync(localPath);

    log(`업로드 중: ${file} (${Math.round(data.length / 1024)} KB) → ${blobPath}`);
    await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    const blobUrl = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${STORAGE_CONTAINER_NAME}/${blobPath}`;
    urlMap.set(localKey, blobUrl);
    log(`✅ 업로드 완료: ${localKey} → ${blobUrl}`);
  }

  return urlMap;
}

/**
 * Markdown 내 로컬 이미지 경로를 Blob URL로 치환
 */
function replaceImagePaths(markdown, urlMap) {
  let result = markdown;
  for (const [localPath, blobUrl] of urlMap.entries()) {
    // Markdown image syntax: ![alt](/images/agenthon/N.jpg)
    const escaped = localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), blobUrl);
  }
  return result;
}

/**
 * Markdown에서 제목 추출 (첫 번째 # 헤딩)
 */
function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Agenthon Interview';
}

/**
 * 요약문 추출 (첫 번째 단락)
 */
function extractExcerpt(markdown) {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!') && !trimmed.startsWith('---')) {
      return trimmed.replace(/\*\*/g, '').slice(0, 200);
    }
  }
  return '';
}

/**
 * Cosmos DB에 post 도큐먼트 생성
 */
async function createPost(container, contentMarkdown) {
  const now = new Date().toISOString();
  const id = uuidv4();
  const slug = 'ai-education-agenthon-interview';
  const category = 'agenthon';

  // 중복 slug 체크
  const { resources: existing } = await container.items.query({
    query: 'SELECT c.id FROM c WHERE c.slug = @slug AND c.category = @category',
    parameters: [
      { name: '@slug', value: slug },
      { name: '@category', value: category },
    ],
  }).fetchAll();

  if (existing.length > 0) {
    warn(`slug '${slug}'가 이미 존재합니다 (id: ${existing[0].id}). 건너뜁니다.`);
    return null;
  }

  const title = extractTitle(contentMarkdown);
  const excerpt = extractExcerpt(contentMarkdown);

  const doc = {
    id,
    partitionKey: category,
    documentType: 'post',
    slug,
    category,
    title,
    contentMarkdown,
    excerpt,
    status: 'published',
    tags: ['agenthon', '인터뷰', 'AI', '교육', 'Copilot'],
    series: null,
    seriesOrder: null,
    thumbnail: null,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (DRY_RUN) {
    log(`[DRY-RUN] Cosmos DB 저장 건너뜀. 도큐먼트 미리보기:`);
    console.log(JSON.stringify({ ...doc, contentMarkdown: doc.contentMarkdown.slice(0, 100) + '...' }, null, 2));
    return doc;
  }

  const { resource } = await container.items.create(doc);
  log(`✅ Cosmos DB 저장 완료: id=${resource.id}, slug=${resource.slug}`);
  return resource;
}

// ─── 메인 ───────────────────────────────────────────────────────────────────
async function main() {
  log(DRY_RUN ? '🔍 DRY-RUN 모드로 실행합니다.' : '🚀 실제 마이그레이션을 시작합니다.');

  // 전제 조건 확인
  if (!COSMOS_ENDPOINT) throw new Error('COSMOS_ENDPOINT 환경변수가 없습니다.');
  if (!STORAGE_ACCOUNT_NAME) throw new Error('STORAGE_ACCOUNT_NAME 환경변수가 없습니다.');
  if (!fs.existsSync(MD_FILE)) throw new Error(`MD 파일 없음: ${MD_FILE}`);
  if (!fs.existsSync(IMAGES_DIR)) throw new Error(`이미지 폴더 없음: ${IMAGES_DIR}`);

  // 클라이언트 초기화
  const blobServiceClient = makeBlobClient();
  const cosmosClient = makeCosmosClient();
  const container = cosmosClient.database(COSMOS_DATABASE_NAME).container(COSMOS_CONTAINER_NAME);

  // 1. 이미지 업로드
  log('--- 1단계: 이미지 Blob Storage 업로드 ---');
  const urlMap = await uploadImages(blobServiceClient);

  // 2. Markdown 파싱 + 이미지 경로 치환
  log('--- 2단계: Markdown 이미지 경로 치환 ---');
  const rawMarkdown = fs.readFileSync(MD_FILE, 'utf-8');
  const processedMarkdown = replaceImagePaths(rawMarkdown, urlMap);

  const replacedCount = [...urlMap.keys()].filter(k => processedMarkdown.includes(urlMap.get(k))).length;
  log(`이미지 경로 치환: ${replacedCount}/${urlMap.size}개`);

  // 3. Cosmos DB 게시글 저장
  log('--- 3단계: Cosmos DB 게시글 저장 ---');
  const post = await createPost(container, processedMarkdown);

  if (post) {
    log('');
    log('✅ 마이그레이션 완료!');
    log(`   - 이미지 업로드: ${urlMap.size}개`);
    log(`   - 게시글: category=${post.category}, slug=${post.slug}, status=${post.status}`);
    if (!DRY_RUN) {
      log('   - Admin에서 확인: https://white-sea-0567ed600.4.azurestaticapps.net/agenthon');
      log('   - Web에서 확인:   https://purple-mud-005887500.7.azurestaticapps.net/agenthon');
    }
  }
}

main().catch(err => {
  console.error('[migrate-agenthon] ❌ 오류:', err.message || err);
  process.exit(1);
});
