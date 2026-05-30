const crypto = require('crypto');
const path = require('path');

const { DefaultAzureCredential } = require('@azure/identity');
const {
  BlobServiceClient,
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters
} = require('@azure/storage-blob');

const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const storageContainerName = process.env.STORAGE_CONTAINER_NAME || 'images';
const storageAttachContainerName = process.env.STORAGE_ATTACH_CONTAINER_NAME || 'attachments';
let blobServiceClient = null;
const READ_SAS_CLOCK_SKEW_MS = 5 * 60 * 1000;

function getBlobServiceClient() {
  if (!storageAccountName) {
    throw new Error('Please define STORAGE_ACCOUNT_NAME in your environment variables.');
  }

  if (!blobServiceClient) {
    blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
  }

  return blobServiceClient;
}

function createUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
}

function sanitizeFileName(fileName) {
  const extension = path.extname(fileName || '').toLowerCase();
  return `${createUuid()}${extension}`;
}

function generateBlobPath(fileName) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `uploads/${yyyy}/${mm}/${sanitizeFileName(fileName)}`;
}

function generateAttachPath(fileName) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `attach/${yyyy}/${mm}/${sanitizeFileName(fileName)}`;
}

async function issueBlobUploadSas({ fileName }) {
  const serviceClient = getBlobServiceClient();
  const blobPath = generateBlobPath(fileName);
  const containerClient = serviceClient.getContainerClient(storageContainerName);
  const blobClient = containerClient.getBlockBlobClient(blobPath);

  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

  const userDelegationKey = await serviceClient.getUserDelegationKey(startsOn, expiresOn);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: storageContainerName,
      blobName: blobPath,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https
    },
    userDelegationKey,
    storageAccountName
  ).toString();

  return {
    uploadUrl: `${blobClient.url}?${sasToken}`,
    blobUrl: blobClient.url,
    expiresAt: expiresOn.toISOString()
  };
}

async function issueBlobAttachSas({ fileName }) {
  const serviceClient = getBlobServiceClient();
  const blobPath = generateAttachPath(fileName);
  const containerClient = serviceClient.getContainerClient(storageAttachContainerName);
  const blobClient = containerClient.getBlockBlobClient(blobPath);

  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

  const userDelegationKey = await serviceClient.getUserDelegationKey(startsOn, expiresOn);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: storageAttachContainerName,
      blobName: blobPath,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https
    },
    userDelegationKey,
    storageAccountName
  ).toString();

  return {
    uploadUrl: `${blobClient.url}?${sasToken}`,
    blobUrl: blobClient.url,
    expiresAt: expiresOn.toISOString()
  };
}

async function getBlobReadSasUrl(blobUrl, validHours) {
  if (!blobUrl) return null;
  try {
    const serviceClient = getBlobServiceClient();
    const url = new URL(blobUrl);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    if (pathSegments.length < 2) return null;

    const containerName = pathSegments[0];
    const blobName = pathSegments.slice(1).join('/');

    const { startsOn, expiresOn } = getReadSasWindow(validHours, new Date(), containerName);

    const userDelegationKey = await serviceClient.getUserDelegationKey(startsOn, expiresOn);
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: startsOn,
        expiresOn: expiresOn,
        protocol: SASProtocol.Https,
      },
      userDelegationKey,
      storageAccountName
    ).toString();

    return url.origin + url.pathname + '?' + sasToken;
  } catch (error) {
    console.error('[getBlobReadSasUrl] failed', error);
    return null;
  }
}

function getReadSasWindow(validHours, now = new Date(), containerName = storageContainerName) {
  void containerName;
  return getRollingReadSasWindow(validHours, now);
}

function getRollingReadSasWindow(validHours, now = new Date()) {
  const hours = Number.isFinite(validHours) && validHours > 0 ? validHours : 1;
  return {
    startsOn: new Date(now.getTime() - READ_SAS_CLOCK_SKEW_MS),
    expiresOn: new Date(now.getTime() + hours * 60 * 60 * 1000)
  };
}

function getStableReadSasWindow(now = new Date()) {
  const dayStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const nextDayStartMs = dayStartMs + 24 * 60 * 60 * 1000;

  return {
    startsOn: new Date(dayStartMs - READ_SAS_CLOCK_SKEW_MS),
    expiresOn: new Date(nextDayStartMs + READ_SAS_CLOCK_SKEW_MS)
  };
}

async function deleteBlobByUrl(blobUrl) {
  if (!blobUrl) {
    return;
  }

  try {
    const serviceClient = getBlobServiceClient();
    const url = new URL(blobUrl);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments.length < 2) {
      return;
    }

    const containerName = pathSegments[0];
    const blobName = pathSegments.slice(1).join('/');
    const blobClient = serviceClient.getContainerClient(containerName).getBlobClient(blobName);

    await blobClient.deleteIfExists();
  } catch (error) {
    console.error('[deleteBlobByUrl] failed', error);
  }
}

module.exports = {
  issueBlobUploadSas,
  issueBlobAttachSas,
  getBlobReadSasUrl,
  getReadSasWindow,
  getStableReadSasWindow,
  deleteBlobByUrl
};
