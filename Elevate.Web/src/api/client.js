const _rawBase =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? (() => { throw new Error('[api/client] VITE_API_BASE_URL is not set in production.'); })()
    : 'https://func-elv-server-ep-dev.azurewebsites.net/api/public');

export const API_BASE = _rawBase.replace(/\/$/, '');
export const API_REQUEST_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 300;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * The deadline includes response bodies and the single transient GET retry.
 * Caller cancellation remains distinct from a timeout and never triggers a retry.
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function apiFetch(path, options = {}) {
  const { signal, ...requestOptions } = options;
  if (signal?.aborted) throw signal.reason;

  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason);
  signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(() => controller.abort(new ApiError(
    '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
    { code: 'RequestTimeout' },
  )), API_REQUEST_TIMEOUT_MS);
  let retryTimer;
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener('abort', onAbort, { once: true });
  });

  async function request() {
    for (let attempt = 0; ; attempt += 1) {
      if (controller.signal.aborted) throw controller.signal.reason;
      try {
        const res = await fetch(`${API_BASE}${path}`, { ...requestOptions, signal: controller.signal });
        if (controller.signal.aborted) throw controller.signal.reason;
        if (res.ok && res.status === 204) return null;

        let body;
        try {
          body = await res.json();
        } catch (error) {
          if (controller.signal.aborted) throw controller.signal.reason;
          if (error.name !== 'SyntaxError') throw error;
          if (res.ok) {
            throw new ApiError('서버 응답 형식이 올바르지 않습니다.', { code: 'InvalidResponse' });
          }
        }

        if (controller.signal.aborted) throw controller.signal.reason;
        if (!res.ok) {
          throw new ApiError(body?.message || `서버 요청에 실패했습니다. (HTTP ${res.status})`, {
            status: res.status,
            code: body?.code,
          });
        }
        return body;
      } catch (error) {
        if (controller.signal.aborted) throw controller.signal.reason;
        const networkError = error instanceof TypeError;
        const retryable = networkError || RETRYABLE_STATUSES.has(error.status);
        if (attempt === 0 && (requestOptions.method || 'GET').toUpperCase() === 'GET' && retryable) {
          await Promise.race([
            new Promise((resolve) => { retryTimer = setTimeout(resolve, RETRY_DELAY_MS); }),
            aborted,
          ]);
          continue;
        }
        if (networkError) {
          throw new ApiError('서버에 연결하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.', {
            code: 'NetworkError',
          });
        }
        throw error;
      }
    }
  }

  try {
    return await Promise.race([request(), aborted]);
  } finally {
    clearTimeout(timeout);
    clearTimeout(retryTimer);
    signal?.removeEventListener('abort', cancel);
    controller.signal.removeEventListener('abort', onAbort);
  }
}
