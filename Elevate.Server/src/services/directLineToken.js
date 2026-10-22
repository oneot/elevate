// 공개 사이트 웹챗(Copilot Studio)이 대화를 시작할 때 쓰는 Direct Line 토큰을 받는다.
// 비밀값(DIRECT_LINE_SECRET)은 서버 앱 설정에만 두고, 브라우저에는 대화 하나에 묶인 단기 토큰만 내려준다.
// 예외를 던지지 않으며, 실패 결과에는 비밀값이나 Direct Line 응답 본문을 담지 않는다.

const DIRECT_LINE_TOKEN_URL = 'https://directline.botframework.com/v3/directline/tokens/generate';
// 웹챗은 토큰 응답을 15초까지 기다리므로 그보다 먼저 끊는다.
const REQUEST_TIMEOUT_MS = 8000;

function readSecret(env) {
  return typeof env.DIRECT_LINE_SECRET === 'string' ? env.DIRECT_LINE_SECRET.trim() : '';
}

async function discardBody(response) {
  try {
    await response.body?.cancel();
  } catch {
    // 본문을 정리하지 못해도 결과는 같다.
  }
}

/**
 * @returns {Promise<{ token: string } | { failure: 'not-configured'|'http'|'invalid-response'|'timeout'|'network', status?: number }>}
 */
async function requestDirectLineToken(options = {}) {
  const { env = process.env, fetchImpl = globalThis.fetch, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const secret = readSecret(env);
  if (!secret) return { failure: 'not-configured' };

  let status;
  try {
    const response = await fetchImpl(DIRECT_LINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
    status = response.status;
    if (!response.ok) {
      await discardBody(response);
      return { failure: 'http', status };
    }

    const data = await response.json();
    if (typeof data?.token !== 'string' || !data.token.trim()) {
      return { failure: 'invalid-response', status };
    }
    return { token: data.token };
  } catch (error) {
    if (error?.name === 'TimeoutError') return { failure: 'timeout' };
    if (status !== undefined) return { failure: 'invalid-response', status };
    return { failure: 'network' };
  }
}

module.exports = {
  DIRECT_LINE_TOKEN_URL,
  REQUEST_TIMEOUT_MS,
  requestDirectLineToken
};
