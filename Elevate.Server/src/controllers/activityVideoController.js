'use strict';

const crypto = require('node:crypto');
const { getActivityVideosContainer } = require('../services/cosmosClient');
const { sendError } = require('../utils/http');

const PARTITION_KEY = 'activityVideo';
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const VALID_STATUSES = new Set(['draft', 'published', 'archived']);

function createUuid() {
  return crypto.randomUUID();
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getActivityVideoId(req) {
  return req.params.activityVideoId || req.params.activityvideoid || req.params.id;
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function validateOptionalSortOrder(value) {
  if (value === undefined) return null;
  if (typeof value !== 'number' && typeof value !== 'string') {
    return 'sortOrder must be a non-negative integer';
  }
  if (typeof value === 'string' && !value.trim()) {
    return 'sortOrder must be a non-negative integer';
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0
    ? null
    : 'sortOrder must be a non-negative integer';
}

function toActivityVideoResponse(doc) {
  return {
    id: doc.id,
    videoId: doc.videoId,
    title: doc.title,
    description: doc.description ?? null,
    category: doc.category,
    year: doc.year,
    channel: doc.channel,
    sortOrder: doc.sortOrder,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function validateStatus(status) {
  if (status === undefined) return null;
  return VALID_STATUSES.has(status) ? null : 'status must be draft, published, or archived';
}

function validateRequiredString(body, fieldName) {
  if (typeof body[fieldName] !== 'string' || !body[fieldName].trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

function validateCreatePayload(body) {
  if (!isPlainObject(body)) return 'request body must be an object';
  if (typeof body.videoId !== 'string' || !YOUTUBE_ID_RE.test(body.videoId.trim())) {
    return 'videoId must be an 11-character YouTube ID';
  }
  for (const fieldName of ['title', 'category', 'year']) {
    const err = validateRequiredString(body, fieldName);
    if (err) return err;
  }
  for (const fieldName of ['description', 'channel']) {
    const err = validateOptionalString(body[fieldName], fieldName);
    if (err) return err;
  }
  const sortOrderError = validateOptionalSortOrder(body.sortOrder);
  if (sortOrderError) return sortOrderError;
  return validateStatus(body.status);
}

function validateUpdatePayload(body) {
  if (!isPlainObject(body)) return 'request body must be an object';
  if (body.videoId !== undefined && (typeof body.videoId !== 'string' || !YOUTUBE_ID_RE.test(body.videoId.trim()))) {
    return 'videoId must be an 11-character YouTube ID';
  }
  for (const fieldName of ['title', 'category', 'year']) {
    if (body[fieldName] !== undefined && (typeof body[fieldName] !== 'string' || !body[fieldName].trim())) {
      return `${fieldName} must be a non-empty string`;
    }
  }
  for (const fieldName of ['description', 'channel']) {
    const err = validateOptionalString(body[fieldName], fieldName);
    if (err) return err;
  }
  const sortOrderError = validateOptionalSortOrder(body.sortOrder);
  if (sortOrderError) return sortOrderError;
  return validateStatus(body.status);
}

function validateOptionalString(value, fieldName) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return `${fieldName} must be a string or null`;
  return null;
}

async function readActivityVideo(container, id, correlationId, res) {
  try {
    const { resource } = await container.item(id, PARTITION_KEY).read();
    if (!resource) {
      sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      return null;
    }
    return resource;
  } catch (error) {
    if (error.code === 404) {
      sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      return null;
    }
    throw error;
  }
}

exports.listPublicActivityVideos = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getActivityVideosContainer();
    const querySpec = {
      query: `SELECT * FROM c
WHERE c.type = @type AND c.status = @status
ORDER BY c.sortOrder ASC, c.createdAt DESC
OFFSET 0 LIMIT 500`,
      parameters: [
        { name: '@type', value: PARTITION_KEY },
        { name: '@status', value: 'published' },
      ],
    };
    const { resources } = await container.items.query(querySpec, { partitionKey: PARTITION_KEY }).fetchAll();
    return res.json({ items: resources.map(toActivityVideoResponse) });
  } catch (error) {
    console.error('[listPublicActivityVideos] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.listAdminActivityVideos = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const status = req.query?.status;
    const statusError = validateStatus(status);
    if (statusError) {
      return sendError(res, 400, 'BadRequest', statusError, correlationId);
    }

    let queryText = 'SELECT * FROM c WHERE c.type = @type';
    const parameters = [{ name: '@type', value: PARTITION_KEY }];

    if (status) {
      queryText += ' AND c.status = @status';
      parameters.push({ name: '@status', value: status });
    }

    queryText += ' ORDER BY c.sortOrder ASC, c.createdAt DESC OFFSET 0 LIMIT 500';

    const container = getActivityVideosContainer();
    const { resources } = await container.items
      .query({ query: queryText, parameters }, { partitionKey: PARTITION_KEY })
      .fetchAll();
    return res.json({ items: resources.map(toActivityVideoResponse) });
  } catch (error) {
    console.error('[listAdminActivityVideos] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getAdminActivityVideoDetail = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getActivityVideosContainer();
    const resource = await readActivityVideo(container, getActivityVideoId(req), correlationId, res);
    if (!resource) return null;
    return res.json(toActivityVideoResponse(resource));
  } catch (error) {
    console.error('[getAdminActivityVideoDetail] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.createActivityVideo = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validateCreatePayload(req.body);
  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }

  try {
    const now = new Date().toISOString();
    const doc = {
      id: createUuid(),
      type: PARTITION_KEY,
      partitionKey: PARTITION_KEY,
      videoId: req.body.videoId.trim(),
      title: req.body.title.trim(),
      description: normalizeOptionalString(req.body.description),
      category: req.body.category.trim(),
      year: req.body.year.trim(),
      channel: normalizeOptionalString(req.body.channel) || 'Microsoft Korea',
      sortOrder: normalizeNumber(req.body.sortOrder),
      status: req.body.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const container = getActivityVideosContainer();
    const { resource } = await container.items.create(doc);
    return res.status(201).json(toActivityVideoResponse(resource));
  } catch (error) {
    console.error('[createActivityVideo] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.updateActivityVideo = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validateUpdatePayload(req.body);
  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }

  try {
    const container = getActivityVideosContainer();
    const existing = await readActivityVideo(container, getActivityVideoId(req), correlationId, res);
    if (!existing) return null;

    const updated = {
      ...existing,
      videoId: req.body.videoId !== undefined ? req.body.videoId.trim() : existing.videoId,
      title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
      description: req.body.description !== undefined
        ? normalizeOptionalString(req.body.description)
        : existing.description ?? null,
      category: req.body.category !== undefined ? req.body.category.trim() : existing.category,
      year: req.body.year !== undefined ? req.body.year.trim() : existing.year,
      channel: req.body.channel !== undefined
        ? normalizeOptionalString(req.body.channel) || 'Microsoft Korea'
        : existing.channel,
      sortOrder: req.body.sortOrder !== undefined ? normalizeNumber(req.body.sortOrder) : existing.sortOrder,
      status: req.body.status !== undefined ? req.body.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    const { resource } = await container.item(getActivityVideoId(req), PARTITION_KEY).replace(updated);
    return res.json(toActivityVideoResponse(resource));
  } catch (error) {
    console.error('[updateActivityVideo] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.deleteActivityVideo = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getActivityVideosContainer();
    try {
      await container.item(getActivityVideoId(req), PARTITION_KEY).delete();
    } catch (error) {
      if (error.code === 404) {
        return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      }
      throw error;
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[deleteActivityVideo] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
