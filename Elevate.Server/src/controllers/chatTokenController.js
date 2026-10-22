// 공개 사이트 웹챗이 대화를 시작할 때 부르는 토큰 발급 (GET /api/public/chat-token).
// 실패하면 원인을 응답에 담지 않고 일반 메시지만 돌려준다. 원인은 로그에 분류와 Direct Line 상태 코드로만 남긴다.

const { requestDirectLineToken } = require('../services/directLineToken');
const { sendError } = require('../utils/http');

const UNAVAILABLE_MESSAGE = 'Chat is temporarily unavailable';

const FAILURES = {
  'not-configured': { status: 503, code: 'ServiceUnavailable', log: () => 'DIRECT_LINE_SECRET app setting is not set' },
  http: { status: 502, code: 'BadGateway', log: (result) => `Direct Line returned HTTP ${result.status}` },
  'invalid-response': { status: 502, code: 'BadGateway', log: (result) => `Direct Line returned HTTP ${result.status} without a usable token` },
  network: { status: 502, code: 'BadGateway', log: () => 'Direct Line request failed before a response' },
  timeout: { status: 504, code: 'GatewayTimeout', log: () => 'Direct Line request timed out' }
};

function logError(req, message) {
  if (req.context && typeof req.context.error === 'function') {
    req.context.error(message);
  } else {
    console.error(message);
  }
}

exports.issueChatToken = async (req, res) => {
  const result = await requestDirectLineToken();
  if (result.token) {
    return res.json({ token: result.token });
  }

  const failure = FAILURES[result.failure] || FAILURES.network;
  logError(req, `[publicChatToken] ${failure.log(result)} (correlationId: ${req.correlationId})`);
  return sendError(res, failure.status, failure.code, UNAVAILABLE_MESSAGE, req.correlationId);
};
