const { deleteAsset } = require('../controllers/adminController');
const { createControllerHandler } = require('./shared/httpHandler');

const adminDeleteAssetHandler = createControllerHandler(deleteAsset, {
  name: 'adminDeleteAsset',
  requireAdminAuth: true
});

const functionDefinition = {
  name: 'adminDeleteAsset',
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'api/admin/assets/{assetId}',
  handler: adminDeleteAssetHandler
};

module.exports = {
  functionDefinition,
  adminDeleteAssetHandler
};