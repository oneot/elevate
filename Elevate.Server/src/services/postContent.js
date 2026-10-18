const { getBlobReadSasUrl } = require('./storageClient');

const BLOB_URL_PATTERN = /https?:\/\/[^"'\s)<>?]*\.blob\.core\.windows\.net\/[^"'\s)<>?]*(?:\?[^"'\s)<>]*)?/g;

function isBlobUrl(url) {
  return typeof url === 'string' && url.includes('.blob.core.windows.net/');
}

function stripBlobSas(url) {
  if (!isBlobUrl(url)) return url;
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return url;
  }
}

function stripBlobSasFromContent(content) {
  if (!content) return content;
  return content.replace(BLOB_URL_PATTERN, (url) => url.split('?')[0]);
}

async function enrichContentWithSas(content, attachmentFileNames) {
  const normalized = stripBlobSasFromContent(content);
  if (!normalized) return normalized;
  const urls = [...new Set(normalized.match(BLOB_URL_PATTERN) || [])];
  const signed = new Map(await Promise.all(urls.map(async (url) => [
    url,
    await getBlobReadSasUrl(url, undefined, attachmentFileNames
      ? { downloadFileName: attachmentFileNames.get(url) }
      : undefined),
  ])));

  // Replace exact matches in one pass; a filename can be a prefix of another URL.
  return normalized.replace(BLOB_URL_PATTERN, (url) => signed.get(url) || url);
}

async function enrichThumbnailWithSas(thumbnail) {
  if (!thumbnail) return thumbnail;
  const enriched = { ...thumbnail };
  if (isBlobUrl(thumbnail.url)) {
    const signedUrl = await getBlobReadSasUrl(thumbnail.url);
    if (signedUrl) enriched.signedUrl = signedUrl;
  }
  if (thumbnail.variants && typeof thumbnail.variants === 'object') {
    const entries = await Promise.all(Object.entries(thumbnail.variants).map(async ([key, variant]) => {
      if (!variant || !isBlobUrl(variant.url)) return [key, variant];
      const signedUrl = await getBlobReadSasUrl(variant.url);
      return [key, signedUrl ? { ...variant, signedUrl } : variant];
    }));
    enriched.variants = Object.fromEntries(entries);
  }
  return enriched;
}

module.exports = {
  stripBlobSas,
  stripBlobSasFromContent,
  enrichContentWithSas,
  enrichThumbnailWithSas,
};
