const { getAdminSeriesList } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminSeriesListHandler = createControllerHandler(getAdminSeriesList, {
  name: 'adminSeriesList',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminSeriesList',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/series',
  handler: adminSeriesListHandler
};

module.exports = {
  functionDefinition,
  adminSeriesListHandler
};
