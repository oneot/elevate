import { trackClientDiagnostic } from './clarity';

const RECOVERY_SESSION_KEY = 'chunk-recovery-attempted';
const CHUNK_LOAD_FAILURE_PATTERNS = [
  'Failed to fetch dynamically imported module',
  'Importing a module script failed',
  'error loading dynamically imported module',
  'Unable to preload CSS',
];

function normalizeErrorMessage(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value?.message) return value.message;
  if (value?.reason?.message) return value.reason.message;
  if (value?.error?.message) return value.error.message;
  return String(value);
}

export function isChunkLoadFailure(value) {
  const message = normalizeErrorMessage(value);
  return CHUNK_LOAD_FAILURE_PATTERNS.some((pattern) => message.includes(pattern));
}

function getBuildId() {
  return window.__BUILD_ID__ || 'unknown';
}

function safeSessionStorageGet(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionStorageSet(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    // If sessionStorage is unavailable, avoid reload loops by not recovering.
    return false;
  }
}

function recordChunkFailure(message, recovered) {
  trackClientDiagnostic('chunk_load_failed', {
    route: `${window.location.pathname}${window.location.search}`,
    build_id: getBuildId(),
    recovered: recovered ? 'true' : 'false',
    message,
  });
}

function handleChunkLoadFailure(eventLike) {
  const message = normalizeErrorMessage(eventLike);
  if (!isChunkLoadFailure(eventLike)) {
    return;
  }

  if (safeSessionStorageGet(RECOVERY_SESSION_KEY) === 'true') {
    recordChunkFailure(message, false);
    return;
  }

  const recoveryMarked = safeSessionStorageSet(RECOVERY_SESSION_KEY, 'true');
  recordChunkFailure(message, recoveryMarked);

  if (!recoveryMarked) {
    return;
  }

  window.location.reload();
}

export function startChunkLoadRecovery() {
  window.addEventListener('error', (event) => {
    handleChunkLoadFailure(event?.error || event?.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    handleChunkLoadFailure(event?.reason);
  });
}
