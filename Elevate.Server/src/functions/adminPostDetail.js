const { getAdminPostDetail } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminPostDetailHandler = createControllerHandler(getAdminPostDetail, {
  name: 'adminPostDetail',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminPostDetail',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/posts/{id}',
  handler: adminPostDetailHandler
};

module.exports = {
  functionDefinition,
  adminPostDetailHandler
};
