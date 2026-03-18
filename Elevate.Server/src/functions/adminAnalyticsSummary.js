const { getAnalyticsSummary } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminAnalyticsSummaryHandler = createControllerHandler(getAnalyticsSummary, {
  name: 'adminAnalyticsSummary',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminAnalyticsSummary',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/analytics/summary',
  handler: adminAnalyticsSummaryHandler
};

module.exports = {
  functionDefinition,
  adminAnalyticsSummaryHandler
};