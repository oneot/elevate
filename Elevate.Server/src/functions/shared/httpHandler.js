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
    const text = await request.text();
    if (contentType.includes('application/json')) {
      return text.trim() ? JSON.parse(text) : null;
    }

    return text || null;
  } catch (error) {
    if (error instanceof SyntaxError) {
      const invalidBody = new Error('Invalid JSON request body');
      invalidBody.status = 400;
      invalidBody.code = 'BadRequest';
      throw invalidBody;
    }
    throw error;
  }
}

function createControllerHandler(controller, options = {}) {
  return async (request, context) => {
    const correlationId = getHeader(request.headers, 'x-correlation-id') || createCorrelationId();

    try {
      // authorize는 관리자 로그인 대신 다른 인증을 쓰는 요청(예: GitHub Actions OIDC)에 쓴다.
      const user = options.authorize
        ? await options.authorize(request)
        : (options.requireAdminAuth ? await authorizeAdminRequest(request) : null);
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

      if (typeof context.error === 'function') {
        context.error(`[${options.name || 'function'}] failed`, error);
      } else if (context.log && typeof context.log.error === 'function') {
        context.log.error(`[${options.name || 'function'}] failed`, error);
      } else {
        console.error(`[${options.name || 'function'}] failed`, error);
      }

      return buildErrorResponse(500, 'InternalServerError', 'Unexpected error occurred', correlationId);
    }
  };
}

module.exports = {
  createControllerHandler
};