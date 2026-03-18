const { createPost } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCreatePostHandler = createControllerHandler(createPost, {
  name: 'adminCreatePost',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCreatePost',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/posts',
  handler: adminCreatePostHandler
};

module.exports = {
  functionDefinition,
  adminCreatePostHandler
};