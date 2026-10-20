// GitHub Actions(AI)가 서버에 직접 쓰는 요청. 인증은 middleware/automationAuth.js(GitHub OIDC)가 맡는다.

const { getPostsContainer } = require('../services/cosmosClient');
const { sendError } = require('../utils/http');

const MAX_EXCERPT_LENGTH = 200;

async function findPostById(container, id) {
  const querySpec = {
    query: 'SELECT TOP 1 * FROM p WHERE p.id = @id AND (NOT IS_DEFINED(p.documentType) OR p.documentType = "post")',
    parameters: [{ name: '@id', value: id }]
  };
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources[0] || null;
}

function validateExcerptPayload(body) {
  if (!body || typeof body !== 'object') return 'Invalid request payload';
  if (typeof body.excerpt !== 'string' || !body.excerpt.trim()) return 'excerpt is required';
  const excerpt = body.excerpt.trim();
  if (excerpt.length > MAX_EXCERPT_LENGTH) return `excerpt must be at most ${MAX_EXCERPT_LENGTH} characters`;
  if (/[\r\n<>]/.test(excerpt)) return 'excerpt must be one line of plain text';
  if (typeof body.slug !== 'string' || !body.slug) return 'slug is required';
  if (typeof body.expectedUpdatedAt !== 'string' || !body.expectedUpdatedAt) return 'expectedUpdatedAt is required';
  return null;
}

/**
 * AI가 본문을 읽고 쓴 요약 한 줄을 게시글에 기재한다 (PUT /api/automation/posts/{id}/excerpt).
 * - 게시된 글이고, AI가 읽은 뒤 바뀌지 않았을 때(updatedAt이 같을 때)만 쓴다. 그 사이 저장되면 409로 건너뛰고 새 저장이 다시 만든다.
 * - 사람이 고친 것이 아니므로 updatedAt은 바꾸지 않는다. 대신 excerptSource·excerptGeneratedAt·excerptRunId를 남긴다.
 * - 읽은 뒤 쓰기 전에 관리자가 저장하는 경우를 막으려고 Cosmos ETag가 같을 때만 바꾼다.
 */
exports.updatePostExcerpt = async (req, res) => {
  const correlationId = req.correlationId;
  const validationError = validateExcerptPayload(req.body);
  if (validationError) {
    return sendError(res, 400, 'BadRequest', validationError, correlationId);
  }

  try {
    const container = getPostsContainer();
    const post = await findPostById(container, req.params.id);
    if (!post || post.slug !== req.body.slug) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }
    if (post.status !== 'published') {
      return sendError(res, 409, 'Conflict', 'Only published posts get an AI excerpt', correlationId);
    }
    if (post.updatedAt !== req.body.expectedUpdatedAt) {
      return sendError(res, 409, 'Conflict', 'The post changed after the excerpt was written', correlationId);
    }

    const updated = {
      ...post,
      excerpt: req.body.excerpt.trim(),
      excerptSource: 'ai',
      excerptGeneratedAt: new Date().toISOString(),
      excerptRunId: req.user?.runId || null
    };
    const options = post._etag ? { accessCondition: { type: 'IfMatch', condition: post._etag } } : undefined;
    const { resource } = await container.item(post.id, post.partitionKey || post.category).replace(updated, options);

    return res.json({
      id: resource.id,
      slug: resource.slug,
      excerpt: resource.excerpt,
      excerptGeneratedAt: resource.excerptGeneratedAt,
      updatedAt: resource.updatedAt
    });
  } catch (error) {
    if (error && (error.code === 412 || error.statusCode === 412)) {
      return sendError(res, 409, 'Conflict', 'The post changed while the excerpt was being written', correlationId);
    }
    console.error('[updatePostExcerpt] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports._test = { validateExcerptPayload, MAX_EXCERPT_LENGTH };
