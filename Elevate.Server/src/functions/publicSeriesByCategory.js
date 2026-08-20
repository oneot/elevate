const { getSeriesByCategory } = require('../controllers/postController');
const { createControllerHandler } = require('./shared/httpHandler');

const handler = createControllerHandler(getSeriesByCategory, {
  name: 'publicSeriesByCategory'
});

const functionDefinition = {
  name: 'publicSeriesByCategory',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/series',
  handler
};

module.exports = { functionDefinition };
