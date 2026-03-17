const { getSeriesPostList } = require('../controllers/postController');
const { createControllerHandler } = require('./shared/httpHandler');

const publicSeriesPostsHandler = createControllerHandler(getSeriesPostList, {
  name: 'publicSeriesPosts'
});

const functionDefinition = {
  name: 'publicSeriesPosts',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/series/{seriesSlug}/posts',
  handler: publicSeriesPostsHandler
};

module.exports = {
  functionDefinition,
  publicSeriesPostsHandler
};