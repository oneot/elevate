const { linkDraftAttachmentsToPost } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminLinkDraftFilesHandler = createControllerHandler(linkDraftAttachmentsToPost, {
  name: 'adminLinkDraftFiles',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminLinkDraftFiles',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/files/link-draft',
  handler: adminLinkDraftFilesHandler
};

module.exports = {
  functionDefinition,
  adminLinkDraftFilesHandler
};
