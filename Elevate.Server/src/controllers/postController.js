const { getPostsContainer } = require('../services/cosmosClient');
const { parsePositiveInt, sendError } = require('../utils/http');

function encodeCursor(post) {
  const payload = {
    publishedAt: post.publishedAt || post.updatedAt
  };

  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodeCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded);

    if (!parsed.publishedAt) {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

function toPostSummary(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    status: post.status,
    publishedAt: post.publishedAt || null,
    updatedAt: post.updatedAt
  };
}

function toPostDetail(post) {
  return {
    ...toPostSummary(post),
    contentMarkdown: post.contentMarkdown || '',
    series: post.series || null,
    thumbnail: post.thumbnail || null
  };
}

function buildListQuery({ limit, cursor, category, tag, seriesSlug }) {
  const whereClauses = ["p.status = 'published'"];
  const parameters = [];

  if (category) {
    whereClauses.push('p.category = @category');
    parameters.push({ name: '@category', value: category });
  }

  if (tag) {
    whereClauses.push('ARRAY_CONTAINS(p.tags, @tag)');
    parameters.push({ name: '@tag', value: tag });
  }

  if (seriesSlug) {
    whereClauses.push('p.series = @seriesSlug');
    parameters.push({ name: '@seriesSlug', value: seriesSlug });
  }

  if (cursor) {
    whereClauses.push('p.publishedAt < @cursorPublishedAt');
    parameters.push({ name: '@cursorPublishedAt', value: cursor.publishedAt });
  }

  return {
    query: `SELECT TOP ${limit} p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt
            FROM p
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY p.publishedAt DESC`,
    parameters
  };
}

exports.getPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    let cursor = null;
    if (req.query.cursor) {
      cursor = decodeCursor(req.query.cursor);
      if (!cursor) {
        return sendError(res, 400, 'BadRequest', 'Invalid cursor value', correlationId);
      }
    }

    const container = getPostsContainer();
    const querySpec = buildListQuery({
      limit,
      cursor,
      category: req.query.category,
      tag: req.query.tag,
      seriesSlug: null
    });

    const { resources } = await container.items.query(querySpec).fetchAll();
    const items = resources.map(toPostSummary);

    return res.json({
      items,
      nextCursor: items.length === limit ? encodeCursor(items[items.length - 1]) : null
    });
  } catch (error) {
    console.error('[getPostList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getPostDetail = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const { category, slug } = req.params;
    const container = getPostsContainer();

    const querySpec = {
      query: `SELECT TOP 1 * FROM p WHERE p.status = 'published' AND p.category = @category AND p.slug = @slug`,
      parameters: [
        { name: '@category', value: category },
        { name: '@slug', value: slug }
      ]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    if (resources.length === 0) {
      return sendError(res, 404, 'NotFound', 'Resource not found', correlationId);
    }

    return res.json(toPostDetail(resources[0]));
  } catch (error) {
    console.error('[getPostDetail] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getSeriesPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    let cursor = null;
    if (req.query.cursor) {
      cursor = decodeCursor(req.query.cursor);
      if (!cursor) {
        return sendError(res, 400, 'BadRequest', 'Invalid cursor value', correlationId);
      }
    }

    const container = getPostsContainer();
    const querySpec = buildListQuery({
      limit,
      cursor,
      category: null,
      tag: null,
      seriesSlug: req.params.seriesSlug
    });

    const { resources } = await container.items.query(querySpec).fetchAll();
    const items = resources.map(toPostSummary);

    return res.json({
      items,
      nextCursor: items.length === limit ? encodeCursor(items[items.length - 1]) : null
    });
  } catch (error) {
    console.error('[getSeriesPostList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getTagList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const container = getPostsContainer();
    const querySpec = {
      query: `SELECT DISTINCT VALUE t FROM p JOIN t IN p.tags WHERE p.status = 'published'`
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const items = resources.filter((tag) => typeof tag === 'string').sort((a, b) => a.localeCompare(b));

    return res.json({ items });
  } catch (error) {
    console.error('[getTagList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
