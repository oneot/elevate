const { issueChatToken } = require('../controllers/chatTokenController');
const { createControllerHandler } = require('./shared/httpHandler');

const issueChatTokenHandler = createControllerHandler(issueChatToken, {
  name: 'publicChatToken'
});

// 토큰은 대화마다 새로 받아야 하므로 오류 응답을 포함해 어떤 응답도 캐시하지 않게 한다.
async function publicChatTokenHandler(request, context) {
  const response = await issueChatTokenHandler(request, context);
  return { ...response, headers: { ...response.headers, 'cache-control': 'no-store' } };
}

const functionDefinition = {
  name: 'publicChatToken',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/chat-token',
  handler: publicChatTokenHandler
};

module.exports = {
  functionDefinition,
  publicChatTokenHandler
};
