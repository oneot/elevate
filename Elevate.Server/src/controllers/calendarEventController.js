'use strict';

const { v4: createUuid } = require('uuid');
const { getCalendarEventsContainer } = require('../services/cosmosClient');
const { parsePositiveInt, sendError } = require('../utils/http');

const PARTITION_KEY = 'calendarEvent';
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getEventId(req) {
  return req.params.eventId || req.params.id;
}

function isValidIsoDateString(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!ISO_DATE_RE.test(trimmed)) return false;
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === trimmed;
}

function validateEventDate(d) {
  if (!isPlainObject(d) || !isValidIsoDateString(d.start)) {
    return 'each eventDate must have a valid start date (YYYY-MM-DD)';
  }
  if (d.end !== undefined && d.end !== null) {
    if (!isValidIsoDateString(d.end)) {
      return 'eventDate end must be a valid date string (YYYY-MM-DD)';
    }
    if (d.end.trim() < d.start.trim()) {
      return 'eventDate end must be >= start';
    }
  }
  return null;
}

function normalizeEventDates(eventDates) {
  if (!Array.isArray(eventDates)) return null;
  return eventDates.map((d) => ({
    start: d.start.trim(),
    ...(d.end !== undefined && d.end !== null && d.end.trim() ? { end: d.end.trim() } : {}),
  }));
}

function validateOptionalString(value, fieldName) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return `${fieldName} must be a string or null`;
  return null;
}

function validateOptionalStringFields(body, fieldNames) {
  for (const fieldName of fieldNames) {
    const err = validateOptionalString(body[fieldName], fieldName);
    if (err) return err;
  }
  return null;
}

function normalizeOptionalString(value) {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function toCalendarEventResponse(doc) {
  return {
    id: doc.id,
    title: doc.title,
    eventDates: doc.eventDates ?? null,
    eventLocation: doc.eventLocation || null,
    eventTarget: doc.eventTarget || null,
    linkedPostId: doc.linkedPostId || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function validateCreatePayload(body) {
  if (!isPlainObject(body)) return 'request body must be an object';
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return 'title is required';
  }
  if (body.eventDates === undefined || body.eventDates === null) {
    return 'eventDates is required';
  }
  if (!Array.isArray(body.eventDates)) {
    return 'eventDates must be an array';
  }
  if (body.eventDates.length === 0) {
    return 'eventDates must contain at least one date';
  }
  for (const d of body.eventDates) {
    const err = validateEventDate(d);
    if (err) return err;
  }
  const optionalStringError = validateOptionalStringFields(body, ['eventLocation', 'eventTarget', 'linkedPostId']);
  if (optionalStringError) return optionalStringError;
  return null;
}

function validateUpdatePayload(body) {
  if (!isPlainObject(body)) return 'request body must be an object';
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) {
    return 'title must be a non-empty string';
  }
  if (body.eventDates !== undefined) {
    if (!Array.isArray(body.eventDates)) {
      return 'eventDates must be an array';
    }
    if (body.eventDates.length === 0) {
      return 'eventDates must contain at least one date';
    }
    for (const d of body.eventDates) {
      const err = validateEventDate(d);
      if (err) return err;
    }
  }
  const optionalStringError = validateOptionalStringFields(body, ['eventLocation', 'eventTarget', 'linkedPostId']);
  if (optionalStringError) return optionalStringError;
  return null;
}

exports.listCalendarEvents = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const query = req.query || {};
    const limit = parsePositiveInt(query.limit, 100, 1, 500);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }
    if (query.start && !isValidIsoDateString(query.start)) {
      return sendError(res, 400, 'BadRequest', 'Invalid start value', correlationId);
    }
    if (query.end && !isValidIsoDateString(query.end)) {
      return sendError(res, 400, 'BadRequest', 'Invalid end value', correlationId);
    }
    if (query.start && query.end && query.end.trim() < query.start.trim()) {
      return sendError(res, 400, 'BadRequest', 'end must be >= start', correlationId);
    }

    const container = getCalendarEventsContainer();
    const linkedPostId = query.linkedPostId;
    const start = query.start?.trim();
    const end = query.end?.trim();

    let queryText = 'SELECT * FROM c WHERE c.type = @type';
    const parameters = [{ name: '@type', value: PARTITION_KEY }];

    if (linkedPostId) {
      queryText += ' AND c.linkedPostId = @linkedPostId';
      parameters.push({ name: '@linkedPostId', value: linkedPostId });
    }

    if (start && end) {
      queryText += ` AND EXISTS(
        SELECT VALUE d FROM d IN c.eventDates
        WHERE d.start <= @end
        AND (
          (IS_DEFINED(d.end) AND NOT IS_NULL(d.end) AND d.end >= @start)
          OR ((NOT IS_DEFINED(d.end) OR IS_NULL(d.end)) AND d.start >= @start)
        )
      )`;
      parameters.push({ name: '@start', value: start });
      parameters.push({ name: '@end', value: end });
    } else if (start) {
      queryText += ` AND EXISTS(
        SELECT VALUE d FROM d IN c.eventDates
        WHERE (
          (IS_DEFINED(d.end) AND NOT IS_NULL(d.end) AND d.end >= @start)
          OR ((NOT IS_DEFINED(d.end) OR IS_NULL(d.end)) AND d.start >= @start)
        )
      )`;
      parameters.push({ name: '@start', value: start });
    } else if (end) {
      queryText += ` AND EXISTS(
        SELECT VALUE d FROM d IN c.eventDates
        WHERE d.start <= @end
      )`;
      parameters.push({ name: '@end', value: end });
    }

    queryText += ` ORDER BY c.createdAt DESC OFFSET 0 LIMIT ${limit}`;

    const { resources } = await container.items
      .query({ query: queryText, parameters }, { partitionKey: PARTITION_KEY })
      .fetchAll();

    return res.json({ items: resources.map(toCalendarEventResponse), limit });
  } catch (error) {
    console.error('[listCalendarEvents] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getCalendarEventDetail = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getCalendarEventsContainer();
    let resource;
    try {
      const result = await container.item(getEventId(req), PARTITION_KEY).read();
      resource = result.resource;
    } catch (e) {
      if (e.code === 404) {
        return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      }
      throw e;
    }
    if (!resource) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }
    return res.json(toCalendarEventResponse(resource));
  } catch (error) {
    console.error('[getCalendarEventDetail] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.createCalendarEvent = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validateCreatePayload(req.body);
  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }
  try {
    const container = getCalendarEventsContainer();
    const now = new Date().toISOString();
    const doc = {
      id: createUuid(),
      type: PARTITION_KEY,
      partitionKey: PARTITION_KEY,
      title: req.body.title.trim(),
      eventDates: normalizeEventDates(req.body.eventDates),
      eventLocation: normalizeOptionalString(req.body.eventLocation),
      eventTarget: normalizeOptionalString(req.body.eventTarget),
      linkedPostId: normalizeOptionalString(req.body.linkedPostId),
      createdAt: now,
      updatedAt: now,
    };
    const { resource } = await container.items.create(doc);
    return res.status(201).json(toCalendarEventResponse(resource));
  } catch (error) {
    console.error('[createCalendarEvent] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.updateCalendarEvent = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validateUpdatePayload(req.body);
  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }
  try {
    const container = getCalendarEventsContainer();
    let existing;
    try {
      const result = await container.item(getEventId(req), PARTITION_KEY).read();
      existing = result.resource;
    } catch (e) {
      if (e.code === 404) {
        return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      }
      throw e;
    }
    if (!existing) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      title: req.body.title !== undefined ? req.body.title.trim() : existing.title,
      eventDates: req.body.eventDates !== undefined
        ? normalizeEventDates(req.body.eventDates)
        : existing.eventDates,
      eventLocation: req.body.eventLocation !== undefined
        ? normalizeOptionalString(req.body.eventLocation)
        : existing.eventLocation,
      eventTarget: req.body.eventTarget !== undefined
        ? normalizeOptionalString(req.body.eventTarget)
        : existing.eventTarget,
      linkedPostId: req.body.linkedPostId !== undefined
        ? normalizeOptionalString(req.body.linkedPostId)
        : existing.linkedPostId,
      updatedAt: now,
    };
    const { resource } = await container.items.upsert(updated);
    return res.json(toCalendarEventResponse(resource));
  } catch (error) {
    console.error('[updateCalendarEvent] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.deleteCalendarEvent = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getCalendarEventsContainer();
    try {
      await container.item(getEventId(req), PARTITION_KEY).delete();
    } catch (e) {
      if (e.code === 404) {
        return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
      }
      throw e;
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[deleteCalendarEvent] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
