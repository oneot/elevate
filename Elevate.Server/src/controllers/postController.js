const { getPostsContainer } = require('../services/cosmosClient');
const { getBlobReadSasUrl } = require('../services/storageClient');
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

function normalizeThumbnail(thumbnail) {
  if (!thumbnail) return null;
  if (typeof thumbnail === 'string') return { url: thumbnail };
  if (thumbnail && typeof thumbnail.url === 'string') return { url: thumbnail.url };
  return null;
}

var BLOB_SAS_PATTERN = /(https?:\/\/[^"'\s\)]*\.blob\.core\.windows\.net\/[^"'\s\)?]*)\?[^"'\s\)]*/g;
var BLOB_BARE_PATTERN = /https?:\/\/[^"'\s\)]*\.blob\.core\.windows\.net\/[^"'\s\)?]*/g;

function isBlobUrl(url) {
  return typeof url === 'string' && url.indexOf('.blob.core.windows.net/') !== -1;
}

async function enrichThumbnailWithSas(thumbnail) {
  if (!thumbnail || !isBlobUrl(thumbnail.url)) return thumbnail;
  const signedUrl = await getBlobReadSasUrl(thumbnail.url);
  if (!signedUrl) return thumbnail;
  return Object.assign({}, thumbnail, { signedUrl });
}

async function enrichContentWithSas(content) {
  if (!content) return content;
  // strip existing SAS tokens first
  BLOB_SAS_PATTERN.lastIndex = 0;
  const normalized = content.replace(BLOB_SAS_PATTERN, '$1');
  BLOB_BARE_PATTERN.lastIndex = 0;
  const matches = normalized.match(BLOB_BARE_PATTERN);
  if (!matches || matches.length === 0) return normalized;
  const uniqueUrls = matches.filter((v, i, a) => a.indexOf(v) === i);
  const signed = await Promise.all(uniqueUrls.map((u) => getBlobReadSasUrl(u)));
  let result = normalized;
  uniqueUrls.forEach((url, i) => {
    if (signed[i]) result = result.split(url).join(signed[i]);
  });
  return result;
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
    updatedAt: post.updatedAt,
    series: post.series || null,
    seriesOrder: post.seriesOrder ?? null,
    thumbnail: normalizeThumbnail(post.thumbnail)
  };
}

function toPostDetail(post) {
  return {
    ...toPostSummary(post),
    contentMarkdown: post.contentMarkdown || '',
    youtube: post.youtube || null
  };
}

function buildListQuery({ limit, page, category, categories, tag }) {
  const offset = (page - 1) * limit;
  const whereClauses = ["p.status = 'published'"];
  const parameters = [];

  if (category) {
    whereClauses.push('p.category = @category');
    parameters.push({ name: '@category', value: category });
  } else if (Array.isArray(categories) && categories.length > 0) {
    const inParams = categories.map((_, i) => `@cat${i}`);
    whereClauses.push(`p.category IN (${inParams.join(', ')})`);
    categories.forEach((c, i) => parameters.push({ name: `@cat${i}`, value: c }));
  }

  if (tag) {
    whereClauses.push('ARRAY_CONTAINS(p.tags, @tag)');
    parameters.push({ name: '@tag', value: tag });
  }

  const whereClause = whereClauses.join(' AND ');
  return {
    dataQuery: {
      query: `SELECT p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt, p.series, p.seriesOrder, p.thumbnail
              FROM p
              WHERE ${whereClause}
              ORDER BY p.publishedAt DESC
              OFFSET ${offset} LIMIT ${limit}`,
      parameters
    },
    countQuery: {
      query: `SELECT VALUE COUNT(1) FROM p WHERE ${whereClause}`,
      parameters
    }
  };
}

exports.getPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 20, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    const page = parsePositiveInt(req.query.page, 1, 1, 10000);
    if (page === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid page value', correlationId);
    }

    const container = getPostsContainer();
    const categoriesParam = req.query.categories
      ? req.query.categories.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const { dataQuery, countQuery } = buildListQuery({
      limit,
      page,
      category: req.query.category,
      categories: categoriesParam,
      tag: req.query.tag
    });

    const [{ resources }, { resources: countResult }] = await Promise.all([
      container.items.query(dataQuery).fetchAll(),
      container.items.query(countQuery).fetchAll()
    ]);

    const totalCount = countResult[0] ?? 0;
    const summaries = resources.map(toPostSummary);
    const items = await Promise.all(summaries.map(async (s) => ({
      ...s,
      thumbnail: await enrichThumbnailWithSas(s.thumbnail)
    })));

    return res.json({
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page
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

    const post = toPostDetail(resources[0]);
    const [thumbnail, contentMarkdown] = await Promise.all([
      enrichThumbnailWithSas(post.thumbnail),
      enrichContentWithSas(post.contentMarkdown)
    ]);

    return res.json({ ...post, thumbnail, contentMarkdown });
  } catch (error) {
    console.error('[getPostDetail] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getSeriesPostList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const limit = parsePositiveInt(req.query.limit, 100, 1, 100);
    if (limit === null) {
      return sendError(res, 400, 'BadRequest', 'Invalid limit value', correlationId);
    }

    const container = getPostsContainer();
    const querySpec = {
      query: `SELECT TOP ${limit} p.id, p.slug, p.category, p.title, p.excerpt, p.tags, p.status, p.publishedAt, p.updatedAt, p.series, p.seriesOrder, p.thumbnail
              FROM p
              WHERE p.status = 'published' AND p.series = @seriesSlug
              ORDER BY p.seriesOrder ASC`,
      parameters: [{ name: '@seriesSlug', value: req.params.seriesSlug }]
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const summaries = resources.map(toPostSummary);
    const items = await Promise.all(summaries.map(async (s) => ({
      ...s,
      thumbnail: await enrichThumbnailWithSas(s.thumbnail)
    })));

    return res.json({ items, nextCursor: null });
  } catch (error) {
    console.error('[getSeriesPostList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getSeriesByCategory = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const { category } = req.query;

    const container = getPostsContainer();
    const whereClauses = [
      "p.status = 'published'",
      'IS_DEFINED(p.series)',
      'p.series != null'
    ];
    const parameters = [];

    if (category) {
      whereClauses.push('p.category = @category');
      parameters.push({ name: '@category', value: category });
    }

    const querySpec = {
      query: `SELECT p.series, p.seriesOrder, p.id, p.slug, p.title
              FROM p
              WHERE ${whereClauses.join(' AND ')}`,
      parameters
    };

    const { resources } = await container.items.query(querySpec).fetchAll();

    const seriesMap = {};
    for (const post of resources) {
      if (!post.series) continue;
      if (!seriesMap[post.series]) {
        seriesMap[post.series] = [];
      }
      seriesMap[post.series].push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        seriesOrder: post.seriesOrder ?? null
      });
    }

    const items = Object.entries(seriesMap)
      .map(([name, posts]) => ({
        name,
        posts: posts.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0))
      }))
      .filter((item) => item.posts.length >= 2)
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({ items });
  } catch (error) {
    console.error('[getSeriesByCategory] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};

exports.getTagList = async (req, res) => {
  const correlationId = req.correlationId;

  try {
    const categoriesParam = req.query.categories
      ? req.query.categories.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    let whereClause = "p.status = 'published'";
    const parameters = [];

    if (Array.isArray(categoriesParam) && categoriesParam.length > 0) {
      const inParams = categoriesParam.map((_, i) => `@cat${i}`);
      whereClause += ` AND p.category IN (${inParams.join(', ')})`;
      categoriesParam.forEach((c, i) => parameters.push({ name: `@cat${i}`, value: c }));
    }

    const container = getPostsContainer();
    const querySpec = {
      query: `SELECT DISTINCT VALUE t FROM p JOIN t IN p.tags WHERE ${whereClause}`,
      parameters
    };

    const { resources } = await container.items.query(querySpec).fetchAll();
    const items = resources.filter((tag) => typeof tag === 'string').sort((a, b) => a.localeCompare(b));

    return res.json({ items });
  } catch (error) {
    console.error('[getTagList] failed', error);
    return sendError(res, 500, 'InternalServerError', 'Unexpected error occurred', correlationId);
  }
};
