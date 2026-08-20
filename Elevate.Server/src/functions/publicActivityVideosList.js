const { listPublicActivityVideos } = require('../controllers/activityVideoController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicActivityVideosListHandler = createControllerHandler(listPublicActivityVideos, {
  name: 'publicActivityVideosList',
  requireAdminAuth: false
});

const functionDefinition = {
  name: 'publicActivityVideosList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/activity-videos',
  handler: publicActivityVideosListHandler
};

module.exports = { functionDefinition, publicActivityVideosListHandler };
