const { getBlobReadSasUrl } = require('../services/storageClient');
const { createControllerHandler } = require('./shared/httpHandler');

const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const storageContainerName = process.env.STORAGE_CONTAINER_NAME || 'images';

const getImageProxy = async (req, res) => {
  const blobPath = req.query.path;
  if (!blobPath) {
    return res.status(400).json({ code: 'BadRequest', message: 'Missing path query parameter' });
  }

  const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${storageContainerName}/${blobPath}`;
  const sasUrl = await getBlobReadSasUrl(blobUrl, 1);

  if (!sasUrl) {
    return res.status(404).json({ code: 'NotFound', message: 'Image not found' });
  }

  return res.status(302).setHeader('Location', sasUrl).send('');
};

const functionDefinition = {
  name: 'publicImageProxy',
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/public/image',
  handler: createControllerHandler(getImageProxy, { name: 'publicImageProxy' })
};

module.exports = { functionDefinition };
