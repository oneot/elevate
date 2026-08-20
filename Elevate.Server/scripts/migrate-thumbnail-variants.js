#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { getPostsContainer } = require('../src/services/cosmosClient');
const { getBlobReadSasUrl } = require('../src/services/storageClient');
const { createAndUploadThumbnailVariants } = require('../src/services/blobImageVariants');
const {
  buildThumbnailVariantPatch,
  shouldMigrateThumbnail,
} = require('../src/utils/thumbnailVariants');

function parseArgs(argv) {
  const args = {
    execute: false,
    force: false,
    category: null,
    ids: [],
    limit: 25,
    out: path.resolve(process.cwd(), 'reports/thumbnail-variant-migration.jsonl'),
  };

  for (const arg of argv) {
    if (arg === '--execute') args.execute = true;
    else if (arg === '--force') args.force = true;
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
  const where = ['IS_DEFINED(p.thumbnail.url)', 'CONTAINS(p.thumbnail.url, ".blob.core.windows.net/")'];
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
      thumbnailUrl: post.thumbnail?.url || null,
    };

    if (!shouldMigrateThumbnail(post, { force: args.force })) {
      skipped += 1;
      writeJsonLine(audit, { ...baseRecord, status: 'skipped' });
      continue;
    }

    planned += 1;
    try {
      const signedOriginal = await getBlobReadSasUrl(post.thumbnail.url);
      if (!signedOriginal) throw new Error('Could not issue read SAS for original thumbnail');

      if (!args.execute) {
        writeJsonLine(audit, { ...baseRecord, status: 'planned' });
        continue;
      }

      const variants = await createAndUploadThumbnailVariants(signedOriginal);
      const patch = buildThumbnailVariantPatch({ original: post.thumbnail, variants });
      await container.item(post.id, post.category).patch(patch);
      changed += 1;
      writeJsonLine(audit, { ...baseRecord, status: 'updated', variants });
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
