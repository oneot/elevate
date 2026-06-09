const { updateActivityVideo } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminActivityVideoUpdateHandler = createControllerHandler(updateActivityVideo, {
  name: 'adminActivityVideoUpdate',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminActivityVideoUpdate',
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'api/admin/activity-videos/{activityVideoId}',
  handler: adminActivityVideoUpdateHandler
};

module.exports = { functionDefinition, adminActivityVideoUpdateHandler };
