const { getPostList } = require('../controllers/postController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicPostsListHandler = createControllerHandler(getPostList, {
  name: 'publicPostsList'
});

const functionDefinition = {
  name: 'publicPostsList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/posts',
  handler: publicPostsListHandler
};

module.exports = {
  functionDefinition,
  publicPostsListHandler
};