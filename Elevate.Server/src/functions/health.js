const packageJson = require('../../package.json');
const { createCorrelationId } = require('../middleware/requestContext');

async function healthHandler(request) {
  const correlationId =
    (request.headers && typeof request.headers.get === 'function' && request.headers.get('x-correlation-id')) ||
    createCorrelationId();

  return {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-correlation-id': correlationId
    },
    jsonBody: {
      status: 'healthy',
      version: packageJson.version,
      correlationId
    }
  };
}

const functionDefinition = {
  name: 'health',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/health',
  handler: healthHandler
};

module.exports = {
  functionDefinition,
  healthHandler
};