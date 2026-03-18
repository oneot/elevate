const crypto = require('crypto');

const { getAssetsContainer, getPostsContainer } = require('../services/cosmosClient');
const { issueBlobUploadSas, deleteBlobByUrl } = require('../services/storageClient');
const { parsePositiveInt, sendError } = require('../utils/http');
const { toSlugBase } = require('../utils/slug');

const allowedStatuses = new Set(['draft', 'published', 'archived']);
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const maxImageSizeBytes = 10 * 1024 * 1024;
const assetCategoryPartition = '_asset';

function encodeAdminCursor(post) {
  const payload = {
    updatedAt: post.updatedAt
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeAdminCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);

    if (!parsed.updatedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function createUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
}

function validatePostCreatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Invalid request payload';
  }

  if (!body.title || typeof body.title !== 'string') {
    return 'title is required';
  }

  if (!body.category || typeof body.category !== 'string') {
    return 'category is required';
  }

  if (!body.contentMarkdown || typeof body.contentMarkdown !== 'string') {
    return 'contentMarkdown is required';
  }

  if (!Array.isArray(body.tags)) {
    return 'tags must be an array';
  }

  if (!allowedStatuses.has(body.status)) {
    return 'status must be one of draft, published, archived';
  }

  return null;
}

function validatePostUpdatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Invalid request payload';
  }

  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.length === 0)) {
    return 'title must be a non-empty string';
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    return 'tags must be an array';
  }

  if (body.status !== undefined && !allowedStatuses.has(body.status)) {
    return 'status must be one of draft, published, archived';
  }

  return null;
}

async function findPostById(container, id) {
  const querySpec = {
    query: 'SELECT TOP 1 * FROM p WHERE p.id = @id AND (NOT IS_DEFINED(p.documentType) OR p.documentType = "post")',
    parameters: [{ name: '@id', value: id }]
  };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources[0] || null;
}

async function slugExists(container, slug, excludeId) {
  const parameters = [{ name: '@slug', value: slug }];
  let query = 'SELECT TOP 1 p.id FROM p WHERE p.slug = @slug';

  if (excludeId) {
    query += ' AND p.id != @excludeId';
    parameters.push({ name: '@excludeId', value: excludeId });
  }

  const { resources } = await container.items.query({ query, parameters }).fetchAll();
  return resources.length > 0;
}

async function resolveUniqueSlug(container, requestedSlug, title, excludeId) {
  const base = toSlugBase(requestedSlug || title);
  let index = 1;
  let candidate = base;

  while (await slugExists(container, candidate, excludeId)) {
    index += 1;
    candidate = `${base}-${index}`;
  }

  return candidate;
}

function toPostResponse(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt || '',
    contentMarkdown: post.contentMarkdown || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
    publishedAt: post.publishedAt || null,
    updatedAt: post.updatedAt,
    series: post.series || null,
    thumbnail: post.thumbnail || null
  };
}

function toPostSummary(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
    publishedAt: post.publishedAt || null,
    updatedAt: post.updatedAt
  };
}

function buildAdminListQuery({ limit, cursor, category, tag, status }) {
  const whereClauses = ['(NOT IS_DEFINED(p.documentType) OR p.documentType = "post")'];
  const parameters = [];

  if (status) {
    whereClauses.push('p.status = @status');
    parameters.push({ name: '@status', value: status });
  }

  if (category) {
    whereClauses.push('p.category = @category');
    parameters.push({ name: '@category', value: category });
  }

  if (tag) {
    whereClauses.push('ARRAY_CONTAINS(p.tags, @tag)');
    parameters.push({ name: '@tag', value: tag });
  }

  if (cursor) {
    whereClauses.push('p.updatedAt < @cursorUpdatedAt');
    parameters.push({ name: '@cursorUpdatedAt', value: cursor.updatedAt });
  }

  return {
    query: `SELECT TOP ${limit} p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt
            FROM p
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY p.updatedAt DESC`,
    parameters
  };
}

exports.getAdminPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    if (req.query.status && !allowedStatuses.has(req.query.status)) {
      return sendError(res, 400, 'BadRequest', 'Invalid status value', correlationId);
    }

    let cursor = null;
    if (req.query.cursor) {
      cursor = decodeAdminCursor(req.query.cursor);
      if (!cursor) {
        return sendError(res, 400, 'BadRequest', 'Invalid cursor value', correlationId);
      }
    }

    const container = getPostsContainer();
    const querySpec = buildAdminListQuery({
      limit,
      cursor,
      category: req.query.category,
      tag: req.query.tag,
      status: req.query.status
    });

    const { resources } = await container.items.query(querySpec).fetchAll();
    const items = resources.map(toPostSummary);

    return res.json({
      items,
      nextCursor: items.length === limit ? encodeAdminCursor(items[items.length - 1]) : null
    });
  } catch (error) {
    console.error('[getAdminPostList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getAdminPostDetail = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const container = getPostsContainer();
    const post = await findPostById(container, req.params.id);

    if (!post) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    return res.json(toPostResponse(post));
  } catch (error) {
    console.error('[getAdminPostDetail] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.createPost = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validatePostCreatePayload(req.body);

  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }

  try {
    const container = getPostsContainer();
    const now = new Date().toISOString();
    let slug;

    if (req.body.slug) {
      slug = toSlugBase(req.body.slug);
      if (await slugExists(container, slug, null)) {
        return sendError(res, 409, 'Conflict', 'Duplicate slug', correlationId);
      }
    } else {
      slug = await resolveUniqueSlug(container, null, req.body.title, null);
    }

    const post = {
      id: createUuid(),
      partitionKey: req.body.category,
      documentType: 'post',
      slug,
      category: req.body.category,
      title: req.body.title,
      excerpt: req.body.excerpt || '',
      contentMarkdown: req.body.contentMarkdown,
      tags: req.body.tags,
      series: req.body.series || null,
      thumbnail: req.body.thumbnail || null,
      status: req.body.status,
      publishedAt: req.body.status === 'published' ? now : null,
      updatedAt: now,
      createdAt: now
    };

    const { resource } = await container.items.create(post);
    return res.status(201).json(toPostResponse(resource));
  } catch (error) {
    console.error('[createPost] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.updatePost = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validatePostUpdatePayload(req.body);

  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }

  try {
    const container = getPostsContainer();
    const existing = await findPostById(container, req.params.id);

    if (!existing) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      excerpt: req.body.excerpt !== undefined ? req.body.excerpt : existing.excerpt,
      contentMarkdown: req.body.contentMarkdown !== undefined ? req.body.contentMarkdown : existing.contentMarkdown,
      tags: req.body.tags !== undefined ? req.body.tags : existing.tags,
      series: req.body.series !== undefined ? req.body.series : existing.series,
      thumbnail: req.body.thumbnail !== undefined ? req.body.thumbnail : existing.thumbnail,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      updatedAt: now
    };

    if (existing.status !== 'published' && updated.status === 'published') {
      updated.publishedAt = now;
    }

    if (updated.status === 'draft') {
      updated.publishedAt = null;
    }

    const { resource } = await container.item(existing.id, existing.partitionKey || existing.category).replace(updated);
    return res.json(toPostResponse(resource));
  } catch (error) {
    console.error('[updatePost] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.deletePost = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const container = getPostsContainer();
    const existing = await findPostById(container, req.params.id);

    if (!existing) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    await container.item(existing.id, existing.partitionKey || existing.category).delete();
    return res.status(204).send();
  } catch (error) {
    console.error('[deletePost] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.issueUploadSas = async (req, res) => {
  const correlationId = req.correlationId;
  const { fileName, contentType, sizeBytes } = req.body || {};

  if (!fileName || !contentType) {
    return sendError(res, 400, 'BadRequest', 'fileName and contentType are required', correlationId);
  }

  if (!allowedMimeTypes.has(contentType)) {
    return sendError(res, 400, 'BadRequest', 'Unsupported contentType', correlationId);
  }

  if (sizeBytes !== undefined && (typeof sizeBytes !== 'number' || sizeBytes <= 0 || sizeBytes > maxImageSizeBytes)) {
    return sendError(res, 400, 'BadRequest', 'Invalid sizeBytes', correlationId);
  }

  try {
    const payload = await issueBlobUploadSas({
      fileName,
      contentType
    });

    return res.json(payload);
  } catch (error) {
    console.error('[issueUploadSas] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.createAssetMetadata = async (req, res) => {
  const correlationId = req.correlationId;
  const { postId, blobUrl, contentType, sizeBytes, fileName } = req.body || {};

  if (!blobUrl || !contentType || !sizeBytes || !fileName) {
    return sendError(res, 400, 'BadRequest', 'Invalid request payload', correlationId);
  }

  if (typeof blobUrl !== 'string') {
    return sendError(res, 400, 'BadRequest', 'blobUrl must be a valid URL string', correlationId);
  }

  try {
    new URL(blobUrl);
  } catch {
    return sendError(res, 400, 'BadRequest', 'blobUrl must be a valid URL string', correlationId);
  }

  if (!allowedMimeTypes.has(contentType)) {
    return sendError(res, 400, 'BadRequest', 'Unsupported contentType', correlationId);
  }

  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > maxImageSizeBytes) {
    return sendError(res, 400, 'BadRequest', 'Invalid sizeBytes', correlationId);
  }

  if (typeof fileName !== 'string' || fileName.trim().length === 0) {
    return sendError(res, 400, 'BadRequest', 'fileName is required', correlationId);
  }

  try {
    const container = getAssetsContainer();
    const assetId = createUuid();
    const now = new Date().toISOString();

    const assetDocument = {
      id: assetId,
      documentType: 'asset',
      category: assetCategoryPartition,
      partitionKey: assetCategoryPartition,
      postId: postId || null,
      blobUrl,
      contentType,
      sizeBytes,
      fileName,
      width: 0,
      height: 0,
      createdAt: now,
      updatedAt: now
    };

    await container.items.create(assetDocument);

    return res.status(201).json({
      assetId,
      url: blobUrl,
      mimeType: contentType,
      sizeBytes,
      width: 0,
      height: 0
    });
  } catch (error) {
    console.error('[createAssetMetadata] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.deleteAsset = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const container = getAssetsContainer();
    const querySpec = {
      query: 'SELECT TOP 1 * FROM c WHERE c.id = @id AND c.documentType = "asset"',
      parameters: [{ name: '@id', value: req.params.assetId }]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const asset = resources[0];

    if (!asset) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    await container.item(asset.id, asset.category || asset.partitionKey || assetCategoryPartition).delete();
    await deleteBlobByUrl(asset.blobUrl);

    return res.status(204).send();
  } catch (error) {
    console.error('[deleteAsset] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const postsContainer = getPostsContainer();

    const querySpec = {
      query: "SELECT p.title, p.slug, p.views, p.uniqueVisitors FROM p WHERE p.status = 'published'"
    };

    const { resources } = await postsContainer.items.query(querySpec).fetchAll();
    const totalPv = resources.reduce((sum, post) => sum + (Number(post.views) || 0), 0);
    const totalUv = resources.reduce((sum, post) => sum + (Number(post.uniqueVisitors) || 0), 0);

    const topPosts = resources
      .map((post) => ({
        title: post.title,
        views: Number(post.views) || 0,
        slug: post.slug
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return res.json({
      totalPv,
      totalUv,
      avgTimeOnPage: '00:00:00',
      dailyTrend: [],
      topPosts
    });
  } catch (error) {
    console.error('[getAnalyticsSummary] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
