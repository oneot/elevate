const { deletePost } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminDeletePostHandler = createControllerHandler(deletePost, {
  name: 'adminDeletePost',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminDeletePost',
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'api/admin/posts/{id}',
  handler: adminDeletePostHandler
};

module.exports = {
  functionDefinition,
  adminDeletePostHandler
};