const test = require('node:test');
const assert = require('node:assert/strict');

const cosmosPath = require.resolve('../src/services/cosmosClient');
const storagePath = require.resolve('../src/services/storageClient');
let post;
let signedCalls;
const attachmentUrl = 'https://account.blob.core.windows.net/attachments/attach/guide.pdf';
const container = { items: { query: () => ({ fetchAll: async () => ({ resources: [post] }) }) } };
require.cache[cosmosPath] = {
  id: cosmosPath, filename: cosmosPath, loaded: true,
  exports: {
    getPostsContainer: () => container,
    getAssetsContainer: () => ({
      items: { query: () => ({
        fetchAll: async () => ({ resources: [{ blobUrl: attachmentUrl, fileName: 'guide.pdf' }] }),
      }) },
    }),
  },
};
require.cache[storagePath] = {
  id: storagePath, filename: storagePath, loaded: true,
  exports: {
    getBlobReadSasUrl: async (url, _hours, options) => {
      signedCalls.push({ url, options });
      return `${url}?signed=current`;
    },
  },
};
const admin = require('../src/controllers/adminController');
const publicPosts = require('../src/controllers/postController');

test.beforeEach(() => {
  post = { id: 'post-1', category: 'm365', slug: 'guide', title: 'Guide', status: 'published' };
  signedCalls = [];
});

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

for (const [name, controller] of [
  ['admin', admin.getAdminPostDetail],
  ['public', publicPosts.getPostDetail],
]) {
  test(`${name} signs complete URLs once without corrupting shared filename prefixes`, async () => {
    const short = 'https://account.blob.core.windows.net/images/image.png';
    const long = `${short}-large.png`;
    post.contentMarkdown = `<img src="${short}?signed=old"><img src="${long}"><img src="${short}">`;
    const res = response();
    await controller({ params: { id: post.id, category: post.category, slug: post.slug }, correlationId: 'x' }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.contentMarkdown, `<img src="${short}?signed=current"><img src="${long}?signed=current"><img src="${short}?signed=current">`);
    assert.deepEqual(signedCalls.map(({ url }) => url).sort(), [short, long].sort());
  });

  test(`${name} preserves surrounding Markdown and external URLs when refreshing SAS`, async () => {
    const image = 'https://account.blob.core.windows.net/images/image.png';
    post.contentMarkdown = `[image](${image}?signed=old) <a href="https://example.test/file?download=1">link</a>`;
    const res = response();
    await controller({ params: { id: post.id, category: post.category, slug: post.slug }, correlationId: 'x' }, res);
    assert.equal(res.body.contentMarkdown, `[image](${image}?signed=current) <a href="https://example.test/file?download=1">link</a>`);
  });
}

test('public attachment signing retains the original download filename', async () => {
  post.contentMarkdown = `<a href="${attachmentUrl}?signed=old">Download</a>`;
  const res = response();
  await publicPosts.getPostDetail({ params: { category: post.category, slug: post.slug }, correlationId: 'x' }, res);
  assert.equal(res.body.contentMarkdown, `<a href="${attachmentUrl}?signed=current">Download</a>`);
  assert.deepEqual(signedCalls, [{ url: attachmentUrl, options: { downloadFileName: 'guide.pdf' } }]);
});
