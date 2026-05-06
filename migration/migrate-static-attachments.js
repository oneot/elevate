/**
 * migrate-static-attachments.js
 * Elevate.Web/public/attach/ 의 정적 첨부파일을 Azure Blob Storage attachments 컨테이너로 마이그레이션
 *
 * 실행:
 *   node migrate-static-attachments.js [--dry-run]
 *
 * 환경변수 (또는 migration/.env):
 *   COSMOS_ENDPOINT    https://{account}.documents.azure.com:443/
 *   COSMOS_DATABASE_NAME  elevate
 *   COSMOS_CONTAINER_NAME  posts
 *   STORAGE_ACCOUNT_NAME   stelvdevimiruajbu5bya
 *   STORAGE_ATTACH_CONTAINER_NAME  attachments   (기본값)
 *
 * 사전 조건: az login + az account set --subscription <id>
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
  } catch {
    // .env 없으면 무시
  }
}
loadEnv(path.join(__dirname, '.env'));

const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { AzureCliCredential } = require('@azure/identity');

const DRY_RUN = process.argv.includes('--dry-run');

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT;
const COSMOS_DATABASE_NAME = process.env.COSMOS_DATABASE_NAME || 'elevate';
const COSMOS_CONTAINER_NAME = process.env.COSMOS_CONTAINER_NAME || 'posts';
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const ATTACH_CONTAINER_NAME = process.env.STORAGE_ATTACH_CONTAINER_NAME || 'attachments';

const ATTACH_DIR = path.join(__dirname, '../Elevate.Web/public/attach');

const MIME_MAP = {
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv',
  '.zip': 'application/zip',
  '.xls': 'application/vnd.ms-excel',
  '.doc': 'application/msword',
};

function createUuid() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

function generateBlobPath(fileName) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const ext = path.extname(fileName).toLowerCase();
  return `attach/${yyyy}/${mm}/${createUuid()}${ext}`;
}

function collectFiles(dir, baseDir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, baseDir, results);
    } else {
      const relativePath = '/attach/' + path.relative(baseDir, full).replace(/\\/g, '/');
      const ext = path.extname(entry.name).toLowerCase();
      if (MIME_MAP[ext]) {
        results.push({ fullPath: full, relativePath, fileName: entry.name, ext });
      }
    }
  }
  return results;
}

async function main() {
  if (!COSMOS_ENDPOINT) throw new Error('COSMOS_ENDPOINT 환경변수가 필요합니다.');
  if (!STORAGE_ACCOUNT_NAME) throw new Error('STORAGE_ACCOUNT_NAME 환경변수가 필요합니다.');

  console.log(DRY_RUN ? '[DRY-RUN 모드]' : '[실제 실행 모드]');
  console.log(`첨부파일 디렉터리: ${ATTACH_DIR}`);
  console.log(`대상 컨테이너: ${ATTACH_CONTAINER_NAME}`);

  const files = collectFiles(ATTACH_DIR, ATTACH_DIR);
  if (files.length === 0) {
    console.log('마이그레이션할 파일이 없습니다.');
    return;
  }

  console.log(`\n파일 ${files.length}개 발견:`);
  for (const f of files) console.log(`  ${f.relativePath}`);

  const credential = new AzureCliCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    credential
  );
  const containerClient = blobServiceClient.getContainerClient(ATTACH_CONTAINER_NAME);

  const cosmosClient = new CosmosClient({ endpoint: COSMOS_ENDPOINT, aadCredentials: credential });
  const container = cosmosClient.database(COSMOS_DATABASE_NAME).container(COSMOS_CONTAINER_NAME);

  // Step 1: 파일 업로드 + 매핑 기록
  const mapping = {}; // relativePath → blobUrl
  const now = new Date().toISOString();

  console.log('\n── Step 1: Blob 업로드 ──');
  for (const file of files) {
    const contentType = MIME_MAP[file.ext];
    const blobPath = generateBlobPath(file.fileName);
    const blobUrl = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${ATTACH_CONTAINER_NAME}/${blobPath}`;

    console.log(`  ${file.relativePath}`);
    console.log(`    → ${blobUrl}`);

    if (!DRY_RUN) {
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      const fileBuffer = fs.readFileSync(file.fullPath);
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });

      // Cosmos에 attach 메타데이터 저장
      const fileId = createUuid();
      await container.items.create({
        id: fileId,
        documentType: 'attach',
        category: '_attach',
        partitionKey: '_attach',
        postId: null,
        blobUrl,
        fileName: file.fileName,
        contentType,
        sizeBytes: fs.statSync(file.fullPath).size,
        createdAt: now,
        updatedAt: now,
        migratedFrom: file.relativePath,
      });
    }

    mapping[file.relativePath] = blobUrl;
  }

  // Step 2: Cosmos 포스트 본문 URL 교체
  console.log('\n── Step 2: 포스트 본문 URL 교체 ──');
  const { resources: posts } = await container.items.query(
    "SELECT * FROM c WHERE NOT IS_DEFINED(c.documentType) OR c.documentType = 'post'"
  ).fetchAll();

  let updatedCount = 0;
  for (const post of posts) {
    let content = post.contentMarkdown || '';
    let changed = false;

    for (const [origPath, blobUrl] of Object.entries(mapping)) {
      if (content.includes(origPath)) {
        content = content.split(origPath).join(blobUrl);
        changed = true;
      }
    }

    if (changed) {
      console.log(`  포스트 업데이트: ${post.id} (${post.title || post.slug || ''})`);
      if (!DRY_RUN) {
        const updated = { ...post, contentMarkdown: content, updatedAt: now };
        await container.item(post.id, post.partitionKey || post.category).replace(updated);
      }
      updatedCount++;
    }
  }

  // Step 3: 리포트
  console.log('\n── 마이그레이션 결과 ──');
  console.log(`업로드된 파일: ${files.length}개`);
  console.log(`업데이트된 포스트: ${updatedCount}개`);
  console.log('\n매핑 테이블:');
  for (const [orig, blob] of Object.entries(mapping)) {
    console.log(`  ${orig}`);
    console.log(`  → ${blob}`);
  }

  if (DRY_RUN) {
    console.log('\n[DRY-RUN] 실제 변경 없음. --dry-run 플래그를 제거하여 실행하세요.');
  } else {
    console.log('\n마이그레이션 완료!');
  }
}

main().catch((err) => {
  console.error('[migrate-static-attachments] 오류:', err);
  process.exit(1);
});
