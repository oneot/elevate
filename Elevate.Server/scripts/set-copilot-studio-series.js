#!/usr/bin/env node

require('dotenv').config();

const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');

const SERIES_NAME = 'Copilot Studio 입문 가이드';
const CATEGORY = 'copilot-studio';
const TARGET_POSTS = [
  { slug: 'post', order: 1, title: '나만의 무드 타입 테스트 만들기' },
  { slug: 'ai-creative-agent-team', order: 2, title: 'AI Creative Agent Team 만들기' },
  { slug: 'new-copilot-studio-api', order: 3, title: 'New Copilot Studio에서 API 연동하기' },
];

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function getEndpoint() {
  return getEnv('COSMOS_ENDPOINT', 'https://coselvdevimiruajbu5bya.documents.azure.com:443/');
}

function getDatabaseName() {
  return getEnv('COSMOS_DATABASE_NAME', getEnv('COSMOS_DB_NAME', 'elevate'));
}

function getContainerName() {
  return getEnv('COSMOS_CONTAINER_NAME', 'posts');
}

function parseArgs(argv) {
  return {
    execute: argv.includes('--execute'),
  };
}

function getContainer() {
  const client = new CosmosClient({
    endpoint: getEndpoint(),
    aadCredentials: new DefaultAzureCredential(),
  });
  return client.database(getDatabaseName()).container(getContainerName());
}

function assertExpectedTargets(posts) {
  const missing = TARGET_POSTS.filter((target) => !posts.some((post) => post.slug === target.slug));
  if (missing.length > 0) {
    throw new Error(`Missing target posts: ${missing.map((item) => item.slug).join(', ')}`);
  }
}

function buildPatchOps(target) {
  return [
    { op: 'set', path: '/series', value: SERIES_NAME },
    { op: 'set', path: '/seriesOrder', value: target.order },
  ];
}

function buildClearPatchOps() {
  return [
    { op: 'set', path: '/series', value: null },
    { op: 'set', path: '/seriesOrder', value: null },
  ];
}

async function fetchCategoryPosts(container) {
  const querySpec = {
    query: `SELECT p.id, p.category, p.slug, p.title, p.series, p.seriesOrder
            FROM p
            WHERE p.category = @category AND p.documentType = 'post'`,
    parameters: [{ name: '@category', value: CATEGORY }],
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const container = getContainer();
  const posts = await fetchCategoryPosts(container);
  assertExpectedTargets(posts);

  const targetSlugs = new Set(TARGET_POSTS.map((item) => item.slug));
  const targets = posts
    .filter((post) => targetSlugs.has(post.slug))
    .map((post) => {
      const target = TARGET_POSTS.find((item) => item.slug === post.slug);
      return {
        ...post,
        nextSeries: SERIES_NAME,
        nextSeriesOrder: target.order,
        patchOps: buildPatchOps(target),
      };
    })
    .sort((a, b) => a.nextSeriesOrder - b.nextSeriesOrder);

  const removals = posts
    .filter((post) => !targetSlugs.has(post.slug) && post.series === SERIES_NAME)
    .map((post) => ({
      ...post,
      nextSeries: null,
      nextSeriesOrder: null,
      patchOps: buildClearPatchOps(),
    }));

  const plan = {
    execute: args.execute,
    category: CATEGORY,
    seriesName: SERIES_NAME,
    assign: targets.map((post) => ({
      slug: post.slug,
      title: post.title,
      currentSeries: post.series || null,
      currentSeriesOrder: post.seriesOrder ?? null,
      nextSeries: post.nextSeries,
      nextSeriesOrder: post.nextSeriesOrder,
    })),
    clear: removals.map((post) => ({
      slug: post.slug,
      title: post.title,
      currentSeries: post.series || null,
      currentSeriesOrder: post.seriesOrder ?? null,
      nextSeries: null,
      nextSeriesOrder: null,
    })),
  };

  console.log(JSON.stringify(plan, null, 2));

  if (!args.execute) {
    return;
  }

  for (const post of [...targets, ...removals]) {
    await container.item(post.id, post.category).patch(post.patchOps);
  }

  console.log(JSON.stringify({
    updated: targets.length,
    cleared: removals.length,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});