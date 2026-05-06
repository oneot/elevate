const { issueAttachUploadSas } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminIssueFileSasHandler = createControllerHandler(issueAttachUploadSas, {
  name: 'adminIssueFileSas',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminIssueFileSas',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/files/sas',
  handler: adminIssueFileSasHandler
};

module.exports = {
  functionDefinition,
  adminIssueFileSasHandler
};
