#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { getPostsContainer } = require('../src/services/cosmosClient');
const {
  buildContentRepairPatch,
  countOrphanBlobUrlTails,
  firstOrphanBlobUrlTail,
  shouldRepairPostContent,
  stripOrphanBlobUrlTails,
} = require('../src/utils/blobUrlHtml');

const SAMPLE_TAIL_MAX_LENGTH = 160;

function parseArgs(argv) {
  const args = {
    execute: false,
    category: null,
    ids: [],
    limit: 100,
    out: path.resolve(process.cwd(), 'reports/post-content-blob-tail-repair.jsonl'),
  };

  for (const arg of argv) {
    if (arg === '--execute') args.execute = true;
    else if (arg.startsWith('--category=')) args.category = arg.slice('--category='.length);
    else if (arg.startsWith('--id=')) args.ids.push(arg.slice('--id='.length));
    else if (arg.startsWith('--limit=')) args.limit = Number.parseInt(arg.slice('--limit='.length), 10);
    else if (arg.startsWith('--out=')) args.out = path.resolve(arg.slice('--out='.length));
  }

  if (!Number.isFinite(args.limit) || args.limit < 1 || args.limit > 500) {
    throw new Error('--limit must be between 1 and 500');
  }
  return args;
}

function buildQuery(args) {
  // documentType 필터는 필수다. COSMOS_ASSETS_CONTAINER_NAME이 posts 컨테이너로
  // 기본 폴백하므로 에셋/첨부파일 도큐먼트가 같은 물리 컨테이너에 함께 존재한다.
  const where = [
    'p.documentType = "post"',
    'IS_DEFINED(p.contentMarkdown)',
    'CONTAINS(p.contentMarkdown, ".blob.core.windows.net/")',
  ];
  const parameters = [];

  if (args.category) {
    where.push('p.category = @category');
    parameters.push({ name: '@category', value: args.category });
  }
  if (args.ids.length > 0) {
    const names = args.ids.map((_, index) => `@id${index}`);
    where.push(`p.id IN (${names.join(', ')})`);
    args.ids.forEach((id, index) => parameters.push({ name: `@id${index}`, value: id }));
  }

  return {
    query: `SELECT TOP ${args.limit} * FROM p WHERE ${where.join(' AND ')} ORDER BY p.updatedAt DESC`,
    parameters,
  };
}

function writeJsonLine(stream, record) {
  stream.write(`${JSON.stringify(record)}\n`);
}

function sampleTail(content) {
  const tail = firstOrphanBlobUrlTail(content);
  return tail ? tail.slice(0, SAMPLE_TAIL_MAX_LENGTH) : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  const audit = fs.createWriteStream(args.out, { flags: 'a' });

  const container = getPostsContainer();
  const { resources } = await container.items.query(buildQuery(args)).fetchAll();

  let planned = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of resources) {
    const baseRecord = {
      at: new Date().toISOString(),
      execute: args.execute,
      postId: post.id,
      slug: post.slug,
      category: post.category,
      tailCount: countOrphanBlobUrlTails(post.contentMarkdown),
    };

    try {
      if (!shouldRepairPostContent(post)) {
        skipped += 1;
        writeJsonLine(audit, { ...baseRecord, status: 'skipped' });
        continue;
      }

      const repaired = stripOrphanBlobUrlTails(post.contentMarkdown);

      if (!args.execute) {
        planned += 1;
        writeJsonLine(audit, {
          ...baseRecord,
          status: 'planned',
          sampleTail: sampleTail(post.contentMarkdown),
        });
        continue;
      }

      await container.item(post.id, post.category).patch(buildContentRepairPatch({ content: repaired }));
      changed += 1;
      writeJsonLine(audit, {
        ...baseRecord,
        status: 'updated',
        sampleTail: sampleTail(post.contentMarkdown),
        lengthBefore: post.contentMarkdown.length,
        lengthAfter: repaired.length,
      });
    } catch (error) {
      failed += 1;
      writeJsonLine(audit, { ...baseRecord, status: 'failed', error: error.message || String(error) });
    }
  }

  audit.end();

  console.log(JSON.stringify({
    execute: args.execute,
    scanned: resources.length,
    planned,
    changed,
    skipped,
    failed,
    audit: args.out,
  }, null, 2));

  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
