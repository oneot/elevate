const { createActivityVideo } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminActivityVideoCreateHandler = createControllerHandler(createActivityVideo, {
  name: 'adminActivityVideoCreate',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminActivityVideoCreate',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/activity-videos',
  handler: adminActivityVideoCreateHandler
};

module.exports = { functionDefinition, adminActivityVideoCreateHandler };
