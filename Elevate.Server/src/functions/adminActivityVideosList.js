const { listAdminActivityVideos } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminActivityVideosListHandler = createControllerHandler(listAdminActivityVideos, {
  name: 'adminActivityVideosList',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminActivityVideosList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/activity-videos',
  handler: adminActivityVideosListHandler
};

module.exports = { functionDefinition, adminActivityVideosListHandler };
