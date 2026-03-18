function createErrorPayload(code, message, correlationId, details) {
  const payload = {
    code,
    message,
    correlationId
  };

  if (details && Object.keys(details).length > 0) {
    payload.details = details;
  }

  return payload;
}

function sendError(res, status, code, message, correlationId, details) {
  return res.status(status).json(createErrorPayload(code, message, correlationId, details));
}

function buildErrorResponse(status, code, message, correlationId, details) {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-correlation-id': correlationId
    },
    jsonBody: createErrorPayload(code, message, correlationId, details)
  };
}

function parsePositiveInt(value, defaultValue, min, max) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return null;
  }

  if (parsed < min || parsed > max) {
    return null;
  }

  return parsed;
}

module.exports = {
  buildErrorResponse,
  createErrorPayload,
  sendError,
  parsePositiveInt
};
