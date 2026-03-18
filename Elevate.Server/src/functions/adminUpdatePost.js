const { updatePost } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminUpdatePostHandler = createControllerHandler(updatePost, {
  name: 'adminUpdatePost',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminUpdatePost',
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'api/admin/posts/{id}',
  handler: adminUpdatePostHandler
};

module.exports = {
  functionDefinition,
  adminUpdatePostHandler
};