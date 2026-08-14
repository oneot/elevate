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
    uploadUrl: `${blobClient.url}?${toHtmlSafeSasToken(sasToken)}`,
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
    uploadUrl: `${blobClient.url}?${toHtmlSafeSasToken(sasToken)}`,
    blobUrl: blobClient.url,
    expiresAt: expiresOn.toISOString()
  };
}

async function getBlobReadSasUrl(blobUrl, validHours, options = {}) {
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
    const sasOptions = {
      containerName: containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: startsOn,
      expiresOn: expiresOn,
      protocol: SASProtocol.Https,
    };
    const contentDisposition = buildDownloadContentDisposition(options.downloadFileName);
    if (contentDisposition) {
      sasOptions.contentDisposition = contentDisposition;
    }

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      userDelegationKey,
      storageAccountName
    ).toString();

    return url.origin + url.pathname + '?' + toHtmlSafeSasToken(sasToken);
  } catch (error) {
    console.error('[getBlobReadSasUrl] failed', error);
    return null;
  }
}

function getReadSasWindow(validHours, now = new Date(), _containerName) {
  return getRollingReadSasWindow(validHours, now);
}

function getRollingReadSasWindow(validHours, now = new Date()) {
  const hours = Number.isFinite(validHours) && validHours > 0 ? validHours : 1;
  return {
    startsOn: new Date(now.getTime() - READ_SAS_CLOCK_SKEW_MS),
    expiresOn: new Date(now.getTime() + hours * 60 * 60 * 1000)
  };
}

function buildDownloadContentDisposition(fileName) {
  if (typeof fileName !== 'string') return null;
  const normalized = fileName
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[/"\\:*?<>|]/g, '_')
    .trim();
  if (!normalized) return null;

  const asciiFallback = normalized.replace(/[^\x20-\x7e]/g, '_') || 'download';
  const encoded = encodeRfc5987ValueChars(normalized);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

function encodeRfc5987ValueChars(value) {
  return encodeURIComponent(value)
    .replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/\*/g, '%2A');
}

// Azure SDK는 SAS 파라미터 값을 encodeURIComponent로만 인코딩하는데, 이 함수는
// ' ( ) 를 이스케이프하지 않는다. Content-Disposition(rscd)은 RFC 5987상 반드시
// filename*=UTF-8'' 형태를 포함하므로 리터럴 작은따옴표가 URL에 남고, 본문 HTML에서
// 블롭 URL을 찾는 정규식(BLOB_SAS_PATTERN 등)이 그 지점을 URL 끝으로 오인해 토큰을
// 잘라버린다. Storage는 서명 검증 전에 쿼리 값을 퍼센트 디코딩하므로 여기서 미리
// 인코딩해도 서명은 그대로 유효하다. sig는 base64라 ' ( ) 를 포함하지 않는다.
function toHtmlSafeSasToken(sasToken) {
  if (typeof sasToken !== 'string' || sasToken.length === 0) return sasToken;
  return sasToken.replace(/['()]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
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
  deleteBlobByUrl,
  _test: {
    buildDownloadContentDisposition,
    encodeRfc5987ValueChars,
    toHtmlSafeSasToken
  }
};
