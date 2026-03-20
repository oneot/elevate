const { getAdminPostList } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminPostsListHandler = createControllerHandler(getAdminPostList, {
  name: 'adminPostsList',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminPostsList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/posts',
  handler: adminPostsListHandler
};

module.exports = {
  functionDefinition,
  adminPostsListHandler
};
