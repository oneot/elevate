const { getFiles } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminGetFilesHandler = createControllerHandler(getFiles, {
  name: 'adminGetFiles',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminGetFiles',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/admin/files',
  handler: adminGetFilesHandler
};

module.exports = {
  functionDefinition,
  adminGetFilesHandler
};
