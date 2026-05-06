const { deleteFile } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminDeleteFileHandler = createControllerHandler(deleteFile, {
  name: 'adminDeleteFile',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminDeleteFile',
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'api/admin/files/{fileId}',
  handler: adminDeleteFileHandler
};

module.exports = {
  functionDefinition,
  adminDeleteFileHandler
};
