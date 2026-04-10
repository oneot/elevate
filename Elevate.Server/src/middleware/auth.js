const { createRemoteJWKSet, jwtVerify } = require('jose');

function getTenantId() {
  return process.env.ENTRA_TENANT_ID || process.env.AUTH_TENANT_ID || '62ae463a-9f12-4edf-8544-4f6ca3834524';
}

function getAudience() {
  return process.env.ENTRA_AUDIENCE || process.env.AUTH_API_AUDIENCE || 'c4ea0eaf-6aaa-42e0-85ff-eef864cd2728';
}

function getIssuer(tenantId) {
  return process.env.ENTRA_ISSUER || `https://login.microsoftonline.com/${tenantId}/v2.0`;
}

class AuthError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let jwksByTenant = new Map();

function getJwks(tenantId) {
  if (!jwksByTenant.has(tenantId)) {
    jwksByTenant.set(
      tenantId,
      createRemoteJWKSet(new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`))
    );
  }

  return jwksByTenant.get(tenantId);
}

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [type, token] = authorizationHeader.split(' ');
  if (!type || !token || type.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
}

function isGuestAccount(payload) {
  const tenantId = getTenantId();

  if (payload.acct === 1 || payload.userType === 'Guest') {
    return true;
  }

  const tokenIdp = String(payload.idp || '').toLowerCase();
  if (!tokenIdp) {
    return false;
  }

  return !tokenIdp.includes(tenantId.toLowerCase());
}

function getAuthorizationHeader(requestLike) {
  if (!requestLike) {
    return null;
  }

  if (typeof requestLike.header === 'function') {
    return requestLike.header('authorization');
  }

  if (requestLike.headers && typeof requestLike.headers.get === 'function') {
    return requestLike.headers.get('authorization');
  }

  return null;
}

async function authorizeAdminRequest(requestLike) {
  const tenantId = getTenantId();
  const audience = getAudience();
  const issuer = getIssuer(tenantId);
  const token = extractBearerToken(getAuthorizationHeader(requestLike));

  if (!token) {
    throw new AuthError(401, 'Unauthorized', 'Missing or invalid access token');
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(tenantId), {
      issuer,
      audience
    });

    if (payload.tid !== tenantId) {
      throw new AuthError(403, 'Forbidden', 'Tenant mismatch or guest account is not allowed');
    }

    if (isGuestAccount(payload)) {
      throw new AuthError(403, 'Forbidden', 'Tenant mismatch or guest account is not allowed');
    }

    return {
      oid: payload.oid,
      upn: payload.preferred_username || payload.upn || null,
      name: payload.name || null,
      tid: payload.tid,
      roles: Array.isArray(payload.roles) ? payload.roles : []
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError(401, 'Unauthorized', 'Missing or invalid access token', {
      reason: error.message
    });
  }
}

module.exports = {
  AuthError,
  authorizeAdminRequest,
  extractBearerToken
};
