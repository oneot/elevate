const crypto = require('crypto');

function createCorrelationId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
}

function attachRequestContext(req, res, next) {
  const requestCorrelationId = req.header('x-correlation-id');
  const correlationId = requestCorrelationId || createCorrelationId();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  next();
}

module.exports = {
  attachRequestContext,
  createCorrelationId
};
