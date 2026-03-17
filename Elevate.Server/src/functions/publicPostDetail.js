const { getPostDetail } = require('../controllers/postController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicPostDetailHandler = createControllerHandler(getPostDetail, {
  name: 'publicPostDetail'
});

const functionDefinition = {
  name: 'publicPostDetail',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/posts/{category}/{slug}',
  handler: publicPostDetailHandler
};

module.exports = {
  functionDefinition,
  publicPostDetailHandler
};