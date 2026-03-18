const { createAssetMetadata } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminCreateAssetHandler = createControllerHandler(createAssetMetadata, {
  name: 'adminCreateAsset',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminCreateAsset',
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'api/admin/assets',
  handler: adminCreateAssetHandler
};

module.exports = {
  functionDefinition,
  adminCreateAssetHandler
};