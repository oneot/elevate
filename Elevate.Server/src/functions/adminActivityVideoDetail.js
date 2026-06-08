const { getAdminActivityVideoDetail } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminActivityVideoDetailHandler = createControllerHandler(getAdminActivityVideoDetail, {
  name: 'adminActivityVideoDetail',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminActivityVideoDetail',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/activity-videos/{activityVideoId}',
  handler: adminActivityVideoDetailHandler
};

module.exports = { functionDefinition, adminActivityVideoDetailHandler };
