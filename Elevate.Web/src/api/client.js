/**
 * @file client.js
 * @description Azure Functions REST API와 통신하는 공통 fetch 래퍼.
 *
 * 모든 API 요청은 이 모듈의 `apiFetch`를 통해 호출된다.
 * 베이스 URL은 `VITE_API_BASE_URL` 환경변수로 지정한다.
 * 프로덕션에서 미설정 시 명시적으로 오류를 throw하며, 개발 환경에서는 기본값(func-elv-server-ep-dev)으로 fallback한다.
 */

const _rawBase =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? (() => { throw new Error('[api/client] VITE_API_BASE_URL is not set in production.'); })()
    : 'https://func-elv-server-ep-dev.azurewebsites.net/api/public');

/** 개발/프로덕션 환경의 API 베이스 URL (trailing slash 제거) */
export const API_BASE = _rawBase.replace(/\/$/, '');

/**
 * API 엔드포인트에 fetch 요청을 보내고 JSON을 반환한다.
 *
 * HTTP 오류(4xx/5xx) 시 서버 응답 본문의 `message`와 `code`를 포함한
 * Error 객체를 throw한다. 응답 본문이 JSON이 아닌 경우에도 안전하게 처리한다.
 *
 * @param {string} path - `API_BASE`에 이어 붙일 경로 (예: `/posts?page=1`)
 * @param {RequestInit} [options={}] - fetch 옵션 (signal, method, headers 등)
 * @returns {Promise<any|null>} 응답 JSON, 또는 204 No Content이면 null
 * @throws {Error} HTTP 오류 또는 네트워크 오류 시
 */
export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    // res.json()이 실패하는 경우(응답 본문이 없거나 JSON이 아닌 경우)에도
    // 빈 객체로 fallback하여 항상 Error 객체를 throw할 수 있도록 한다.
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = body.code;
    throw err;
  }

  // 204 No Content: 응답 본문이 없으므로 res.json() 호출 없이 null을 반환한다.
  if (res.status === 204) return null;
  return res.json();
}
