const { createFileMetadata } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCreateFileHandler = createControllerHandler(createFileMetadata, {
  name: 'adminCreateFile',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCreateFile',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/files',
  handler: adminCreateFileHandler
};

module.exports = {
  functionDefinition,
  adminCreateFileHandler
};
