const { updatePostExcerpt } = require('../controllers/automationController');
const { authorizeAutomationRequest } = require('../middleware/automationAuth');
const { createControllerHandler } = require('./shared/httpHandler');

// 관리자 로그인이 아니라 GitHub Actions OIDC 토큰으로 인증한다 ('Post thumbnails'가 AI 요약을 기재).
const automationPostExcerptHandler = createControllerHandler(updatePostExcerpt, {
  name: 'automationPostExcerpt',
  authorize: (request) => authorizeAutomationRequest(request)
});

const functionDefinition = {
  name: 'automationPostExcerpt',
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'api/automation/posts/{id}/excerpt',
  handler: automationPostExcerptHandler
};

module.exports = {
  functionDefinition,
  automationPostExcerptHandler
};
