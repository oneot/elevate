const { deleteActivityVideo } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminActivityVideoDeleteHandler = createControllerHandler(deleteActivityVideo, {
  name: 'adminActivityVideoDelete',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminActivityVideoDelete',
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'api/admin/activity-videos/{activityVideoId}',
  handler: adminActivityVideoDeleteHandler
};

module.exports = { functionDefinition, adminActivityVideoDeleteHandler };
