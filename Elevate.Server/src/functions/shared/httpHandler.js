const { createCorrelationId } = require('../../middleware/requestContext');
const { authorizeAdminRequest } = require('../../middleware/auth');
const { buildErrorResponse } = require('../../utils/http');

function getHeader(headers, name) {
  if (!headers) {
    return null;
  }

  if (typeof headers.get === 'function') {
    return headers.get(name);
  }

  return headers[name.toLowerCase()] || headers[name] || null;
}

function getQueryEntries(query) {
  if (!query) {
    return [];
  }

  if (typeof query.entries === 'function') {
    return Array.from(query.entries());
  }

  return Object.entries(query);
}

function createRequestAdapter({ request, context, correlationId, body, user }) {
  return {
    body,
    context,
    correlationId,
    headers: request.headers,
    log: context.log || console,
    method: request.method,
    params: request.params || {},
    query: Object.fromEntries(getQueryEntries(request.query)),
    url: request.url,
    user,
    header(name) {
      return getHeader(request.headers, name);
    }
  };
}

function createResponseAdapter(correlationId) {
  let statusCode = 200;
  let body;
  let jsonBody;
  const headers = {
    'x-correlation-id': correlationId
  };

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
      return this;
    },
    json(payload) {
      headers['content-type'] = 'application/json; charset=utf-8';
      jsonBody = payload;
      body = undefined;
      return this;
    },
    send(payload = '') {
      if (typeof payload === 'object' && payload !== null) {
        headers['content-type'] = 'application/json; charset=utf-8';
        jsonBody = payload;
        body = undefined;
        return this;
      }

      body = payload;
      return this;
    },
    toHttpResponse() {
      if (statusCode === 204) {
        return { status: statusCode, headers };
      }

      if (jsonBody !== undefined) {
        return { status: statusCode, headers, jsonBody };
      }

      if (body !== undefined) {
        return { status: statusCode, headers, body };
      }

      return { status: statusCode, headers };
    }
  };
}

async function readRequestBody(request) {
  if (!request || request.method === 'GET' || request.method === 'HEAD') {
    return null;
  }

  const contentType = String(getHeader(request.headers, 'content-type') || '').toLowerCase();

  try {
    if (contentType.includes('application/json')) {
      return await request.json();
    }

    const text = await request.text();
    return text || null;
  } catch (error) {
    return null;
  }
}

function createControllerHandler(controller, options = {}) {
  return async (request, context) => {
    const correlationId = getHeader(request.headers, 'x-correlation-id') || createCorrelationId();

    try {
      const user = options.requireAdminAuth ? await authorizeAdminRequest(request) : null;
      const req = createRequestAdapter({
        request,
        context,
        correlationId,
        body: await readRequestBody(request),
        user
      });
      const res = createResponseAdapter(correlationId);

      await controller(req, res);
      return res.toHttpResponse();
    } catch (error) {
      if (error && error.status && error.code) {
        return buildErrorResponse(
          error.status,
          error.code,
          error.message,
          correlationId,
          error.details
        );
      }

      if (context.log && typeof context.log.error === 'function') {
        context.log.error(`[${options.name || 'function'}] failed`, error);
      }

      return buildErrorResponse(500, 'InternalServerError', 'Unexpected error occurred', correlationId);
    }
  };
}

module.exports = {
  createControllerHandler
};