const sharp = require('sharp');
const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

const { buildVariantBlobPath, requiredThumbnailVariantSpecs } = require('../utils/thumbnailVariants');

const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const storageContainerName = process.env.STORAGE_CONTAINER_NAME || 'images';
const imageBlobCacheControl = 'private, max-age=2592000';

let serviceClient;

function getServiceClient() {
  if (!storageAccountName) {
    throw new Error('Please define STORAGE_ACCOUNT_NAME in your environment variables.');
  }
  if (!serviceClient) {
    serviceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      new DefaultAzureCredential()
    );
  }
  return serviceClient;
}

function getResizedDimensions({ width, height, maxWidth }) {
  if (!width || !height || width <= maxWidth) return { width, height };
  const scale = maxWidth / width;
  return {
    width: maxWidth,
    height: Math.max(1, Math.round(height * scale)),
  };
}

function getVariantContentSettings() {
  return {
    blobHTTPHeaders: {
      blobContentType: 'image/webp',
      blobCacheControl: imageBlobCacheControl,
    },
  };
}

async function downloadBlobBuffer(sourceUrl) {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function generateVariantBuffer(inputBuffer, spec) {
  const image = sharp(inputBuffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const dimensions = getResizedDimensions({
    width: metadata.width,
    height: metadata.height,
    maxWidth: spec.maxWidth,
  });
  const buffer = await image
    .resize({ width: dimensions.width, withoutEnlargement: true })
    .webp({ quality: spec.quality })
    .toBuffer();

  return {
    buffer,
    width: dimensions.width,
    height: dimensions.height,
    type: spec.type,
    sizeBytes: buffer.length,
  };
}

async function uploadVariant({ sourceUrl, spec, variant }) {
  const blobPath = buildVariantBlobPath(sourceUrl, spec.key);
  const client = getServiceClient()
    .getContainerClient(storageContainerName)
    .getBlockBlobClient(blobPath);

  await client.uploadData(variant.buffer, getVariantContentSettings());
  return {
    url: client.url,
    width: variant.width,
    height: variant.height,
    type: variant.type,
    sizeBytes: variant.sizeBytes,
  };
}

async function createAndUploadThumbnailVariants(sourceUrl) {
  const inputBuffer = await downloadBlobBuffer(sourceUrl);
  const entries = [];
  for (const spec of requiredThumbnailVariantSpecs) {
    const variant = await generateVariantBuffer(inputBuffer, spec);
    const uploaded = await uploadVariant({ sourceUrl, spec, variant });
    entries.push([spec.key, uploaded]);
  }
  return Object.fromEntries(entries);
}

module.exports = {
  getResizedDimensions,
  getVariantContentSettings,
  downloadBlobBuffer,
  generateVariantBuffer,
  uploadVariant,
  createAndUploadThumbnailVariants,
};
