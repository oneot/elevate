const { issueUploadSas } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminIssueAssetSasHandler = createControllerHandler(issueUploadSas, {
  name: 'adminIssueAssetSas',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminIssueAssetSas',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/assets/sas',
  handler: adminIssueAssetSasHandler
};

module.exports = {
  functionDefinition,
  adminIssueAssetSasHandler
};