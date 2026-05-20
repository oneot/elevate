const crypto = require('crypto');

const { getAssetsContainer, getPostsContainer } = require('../services/cosmosClient');
const { issueBlobUploadSas, issueBlobAttachSas, getBlobReadSasUrl, deleteBlobByUrl } = require('../services/storageClient');
const { parsePositiveInt, sendError } = require('../utils/http');
const { toSlugBase } = require('../utils/slug');

const allowedStatuses = new Set(['draft', 'published', 'archived']);
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif'
]);
const maxImageSizeBytes = 10 * 1024 * 1024;
const assetCategoryPartition = '_asset';

const allowedAttachMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'text/csv',
  'application/zip',
  'application/vnd.ms-excel',
  'application/msword'
]);
const maxAttachSizeBytes = 50 * 1024 * 1024;
const attachCategoryPartition = '_attach';

var BLOB_SAS_PATTERN = /(https?:\/\/[^"'\s]*\.blob\.core\.windows\.net\/[^"'\s?]*)\?[^"'\s]*/g;
var BLOB_BARE_PATTERN = /https?:\/\/[^"'\s]*\.blob\.core\.windows\.net\/[^"'\s?]*/g;

function isBlobUrl(url) {
  return typeof url === 'string' && url.indexOf('.blob.core.windows.net/') !== -1;
}

function stripBlobSas(url) {
  if (!isBlobUrl(url)) return url;
  try {
    var parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch (e) {
    return url;
  }
}

function stripBlobSasFromHtml(html) {
  if (!html) return html;
  BLOB_SAS_PATTERN.lastIndex = 0;
  return html.replace(BLOB_SAS_PATTERN, '$1');
}

async function enrichHtmlWithSas(html) {
  if (!html) return html;
  BLOB_SAS_PATTERN.lastIndex = 0;
  var normalized = html.replace(BLOB_SAS_PATTERN, '$1');
  BLOB_BARE_PATTERN.lastIndex = 0;
  var matches = normalized.match(BLOB_BARE_PATTERN);
  if (!matches || matches.length === 0) return normalized;
  var uniqueUrls = matches.filter(function(v, i, a) { return a.indexOf(v) === i; });
  var signed = await Promise.all(uniqueUrls.map(function(u) { return getBlobReadSasUrl(u); }));
  var result = normalized;
  uniqueUrls.forEach(function(url, i) {
    if (signed[i]) {
      result = result.split(url).join(signed[i]);
    }
  });
  return result;
}

async function enrichThumbnailWithSas(thumbnail) {
  if (!thumbnail || !isBlobUrl(thumbnail.url)) return thumbnail;
  var signedUrl = await getBlobReadSasUrl(thumbnail.url);
  if (!signedUrl) return thumbnail;
  return Object.assign({}, thumbnail, { signedUrl: signedUrl });
}

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

  if (body.youtube !== undefined && body.youtube !== null && typeof body.youtube !== 'string') {
    return 'youtube must be a string or null';
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
    thumbnail: post.thumbnail || null,
    youtube: post.youtube || null
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

function buildAdminListQuery({ limit, page, category, tag, status, search }) {
  const offset = (page - 1) * limit;
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

  if (search) {
    whereClauses.push('(CONTAINS(p.title, @search, true) OR CONTAINS(p.excerpt, @search, true) OR CONTAINS(p.slug, @search, true))');
    parameters.push({ name: '@search', value: search });
  }

  const whereClause = whereClauses.join(' AND ');
  return {
    dataQuery: {
      query: `SELECT p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt
              FROM p
              WHERE ${whereClause}
              ORDER BY p.updatedAt DESC
              OFFSET ${offset} LIMIT ${limit}`,
      parameters
    },
    countQuery: {
      query: `SELECT VALUE COUNT(1) FROM p WHERE ${whereClause}`,
      parameters
    }
  };
}

exports.getAdminPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    const page = parsePositiveInt(req.query.page, 1, 1, 10000);
    if (page === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid page value', correlationId);
    }

    if (req.query.status && !allowedStatuses.has(req.query.status)) {
      return sendError(res, 400, 'BadRequest', 'Invalid status value', correlationId);
    }

    const container = getPostsContainer();
    const search = (req.query.search || '').trim();
    const { dataQuery, countQuery } = buildAdminListQuery({
      limit,
      page,
      category: req.query.category,
      tag: req.query.tag,
      status: req.query.status,
      search: search || undefined,
    });

    const [{ resources }, { resources: countResult }] = await Promise.all([
      container.items.query(dataQuery).fetchAll(),
      container.items.query(countQuery).fetchAll()
    ]);

    const totalCount = countResult[0] ?? 0;
    const items = resources.map(toPostSummary);

    return res.json({
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page
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

    const baseResponse = toPostResponse(post);
    if (baseResponse.thumbnail) {
      baseResponse.thumbnail = await enrichThumbnailWithSas(baseResponse.thumbnail);
    }
    if (baseResponse.contentMarkdown) {
      baseResponse.contentMarkdown = await enrichHtmlWithSas(baseResponse.contentMarkdown);
    }
    return res.json(baseResponse);
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
      contentMarkdown: stripBlobSasFromHtml(req.body.contentMarkdown),
      tags: req.body.tags,
      series: req.body.series || null,
      thumbnail: req.body.thumbnail ? Object.assign({}, req.body.thumbnail, { url: stripBlobSas(req.body.thumbnail.url) }) : null,
      youtube: req.body.youtube || null,
      status: req.body.status,
      publishedAt: req.body.status === 'published' ? now : null,
      updatedAt: now,
      createdAt: now
    };

    const { resource } = await container.items.create(post);
    const createResponse = toPostResponse(resource);
    if (createResponse.thumbnail) {
      createResponse.thumbnail = await enrichThumbnailWithSas(createResponse.thumbnail);
    }
    return res.status(201).json(createResponse);
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
    const incomingThumbnail = req.body.thumbnail !== undefined ? req.body.thumbnail : existing.thumbnail;
    const normalizedThumbnail = incomingThumbnail
      ? Object.assign({}, incomingThumbnail, { url: stripBlobSas(incomingThumbnail.url) })
      : incomingThumbnail;
    const incomingContent = req.body.contentMarkdown !== undefined ? req.body.contentMarkdown : existing.contentMarkdown;
    const updated = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title : existing.title,
      excerpt: req.body.excerpt !== undefined ? req.body.excerpt : existing.excerpt,
      contentMarkdown: stripBlobSasFromHtml(incomingContent),
      tags: req.body.tags !== undefined ? req.body.tags : existing.tags,
      series: req.body.series !== undefined ? req.body.series : existing.series,
      thumbnail: normalizedThumbnail,
      youtube: req.body.youtube !== undefined ? (req.body.youtube || null) : (existing.youtube || null),
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
    const updateResponse = toPostResponse(resource);
    if (updateResponse.thumbnail) {
      updateResponse.thumbnail = await enrichThumbnailWithSas(updateResponse.thumbnail);
    }
    return res.json(updateResponse);
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

    // 연결된 에셋(images)과 첨부파일(attach) 조회
    const assetsContainer = getAssetsContainer();
    const linkedQuery = {
      query: 'SELECT * FROM c WHERE c.postId = @postId AND (c.documentType = "asset" OR c.documentType = "attach")',
      parameters: [{ name: '@postId', value: existing.id }]
    };
    const { resources: linkedDocs } = await assetsContainer.items.query(linkedQuery).fetchAll();

    // 에셋/첨부파일 연쇄 삭제 (best-effort)
    await Promise.all(linkedDocs.map(async (doc) => {
      try {
        await deleteBlobByUrl(doc.blobUrl);
      } catch (err) {
        console.error(`[deletePost] blob deletion failed for doc ${doc.id}`, err);
      }
      try {
        const pk = doc.partitionKey || doc.category;
        await assetsContainer.item(doc.id, pk).delete();
      } catch (err) {
        console.error(`[deletePost] cosmos doc deletion failed for doc ${doc.id}`, err);
      }
    }));

    // 썸네일 블롭 삭제 (best-effort)
    const thumbnailUrl = existing.thumbnail?.url;
    if (thumbnailUrl) {
      try {
        await deleteBlobByUrl(thumbnailUrl);
      } catch (err) {
        console.error('[deletePost] thumbnail blob deletion failed', err);
      }
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

    const signedUrl = await getBlobReadSasUrl(blobUrl);
    return res.status(201).json({
      assetId,
      url: blobUrl,
      signedUrl: signedUrl || null,
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

exports.issueAttachUploadSas = async (req, res) => {
  const correlationId = req.correlationId;
  const { fileName, contentType, sizeBytes } = req.body || {};

  if (!fileName || !contentType) {
    return sendError(res, 400, 'BadRequest', 'fileName and contentType are required', correlationId);
  }

  if (!allowedAttachMimeTypes.has(contentType)) {
    return sendError(res, 400, 'BadRequest', 'Unsupported contentType', correlationId);
  }

  if (sizeBytes !== undefined && (typeof sizeBytes !== 'number' || sizeBytes <= 0 || sizeBytes > maxAttachSizeBytes)) {
    return sendError(res, 400, 'BadRequest', 'Invalid sizeBytes', correlationId);
  }

  try {
    const payload = await issueBlobAttachSas({ fileName });
    return res.json(payload);
  } catch (error) {
    console.error('[issueAttachUploadSas] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.createFileMetadata = async (req, res) => {
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

  if (!allowedAttachMimeTypes.has(contentType)) {
    return sendError(res, 400, 'BadRequest', 'Unsupported contentType', correlationId);
  }

  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > maxAttachSizeBytes) {
    return sendError(res, 400, 'BadRequest', 'Invalid sizeBytes', correlationId);
  }

  if (typeof fileName !== 'string' || fileName.trim().length === 0) {
    return sendError(res, 400, 'BadRequest', 'fileName is required', correlationId);
  }

  try {
    const container = getAssetsContainer();
    const fileId = createUuid();
    const now = new Date().toISOString();

    const fileDocument = {
      id: fileId,
      documentType: 'attach',
      category: attachCategoryPartition,
      partitionKey: attachCategoryPartition,
      postId: postId || null,
      blobUrl,
      contentType,
      sizeBytes,
      fileName,
      createdAt: now,
      updatedAt: now
    };

    await container.items.create(fileDocument);

    const signedUrl = await getBlobReadSasUrl(blobUrl);
    return res.status(201).json({
      fileId,
      url: blobUrl,
      signedUrl: signedUrl || null,
      fileName,
      contentType,
      sizeBytes
    });
  } catch (error) {
    console.error('[createFileMetadata] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.deleteFile = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const container = getAssetsContainer();
    const querySpec = {
      query: 'SELECT TOP 1 * FROM c WHERE c.id = @id AND c.documentType = "attach"',
      parameters: [{ name: '@id', value: req.params.fileId }]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const file = resources[0];

    if (!file) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    await container.item(file.id, file.category || file.partitionKey || attachCategoryPartition).delete();
    await deleteBlobByUrl(file.blobUrl);

    return res.status(204).send();
  } catch (error) {
    console.error('[deleteFile] failed', error);
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
