'use strict';

const { v4: createUuid } = require('uuid');
const { getCalendarEventsContainer } = require('../services/cosmosClient');
const { sendError } = require('../utils/http');

const PARTITION_KEY = 'calendarEvent';

function toCalendarEventResponse(doc) {
  return {
    id: doc.id,
    title: doc.title,
    eventDates: doc.eventDates || null,
    eventLocation: doc.eventLocation || null,
    eventTarget: doc.eventTarget || null,
    linkedPostId: doc.linkedPostId || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function validateCreatePayload(body) {
  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return 'title is required';
  }
  if (body.eventDates !== undefined && body.eventDates !== null && !Array.isArray(body.eventDates)) {
    return 'eventDates must be an array';
  }
  if (Array.isArray(body.eventDates)) {
    for (const d of body.eventDates) {
      if (!d || typeof d.start !== 'string') return 'each eventDate must have a start string';
    }
  }
  return null;
}

function validateUpdatePayload(body) {
  if (!body) return 'request body is required';
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) {
    return 'title must be a non-empty string';
  }
  if (body.eventDates !== undefined && body.eventDates !== null && !Array.isArray(body.eventDates)) {
    return 'eventDates must be an array or null';
  }
  if (Array.isArray(body.eventDates)) {
    for (const d of body.eventDates) {
      if (!d || typeof d.start !== 'string') return 'each eventDate must have a start string';
    }
  }
  return null;
}

exports.listCalendarEvents = async (req, res) => {
  const correlationId = req.correlationId;
  try {
    const container = getCalendarEventsContainer();
    const linkedPostId = req.query.linkedPostId;

    let queryText = 'SELECT * FROM c WHERE c.type = @type';
    const parameters = [{ name: '@type', value: PARTITION_KEY }];

    if (linkedPostId) {
      queryText += ' AND c.linkedPostId = @linkedPostId';
      parameters.push({ name: '@linkedPostId', value: linkedPostId });
    }

    queryText += ' ORDER BY c.createdAt DESC';

    const { resources } = await container.items
      .query({ query: queryText, parameters }, { partitionKey: PARTITION_KEY })
      .fetchAll();

    return res.json({ items: resources.map(toCalendarEventResponse) });
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
      const result = await container.item(req.params.id, PARTITION_KEY).read();
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
      title: req.body.title.trim(),
      eventDates: Array.isArray(req.body.eventDates) ? req.body.eventDates : null,
      eventLocation: req.body.eventLocation || null,
      eventTarget: req.body.eventTarget || null,
      linkedPostId: req.body.linkedPostId || null,
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
      const result = await container.item(req.params.id, PARTITION_KEY).read();
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
        ? (Array.isArray(req.body.eventDates) ? req.body.eventDates : null)
        : existing.eventDates,
      eventLocation: req.body.eventLocation !== undefined
        ? (req.body.eventLocation || null)
        : existing.eventLocation,
      eventTarget: req.body.eventTarget !== undefined
        ? (req.body.eventTarget || null)
        : existing.eventTarget,
      linkedPostId: req.body.linkedPostId !== undefined
        ? (req.body.linkedPostId || null)
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
      await container.item(req.params.id, PARTITION_KEY).delete();
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
