import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const siteUrl = 'https://microsoft-elevate.com';
const distDir = join(process.cwd(), 'dist');
const templatePath = join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf8');
const defaultImage = `${siteUrl}/og-image.png`;
const rawApiBaseUrl = process.env.VITE_API_BASE_URL;
const apiBaseUrl = rawApiBaseUrl?.replace(/\/$/, '');
const requireApiRoutes = process.env.REQUIRE_API_ROUTES === 'true';

const routes = [
  {
    path: '/update',
    title: 'AI & M365 최신 정보 | Microsoft Elevate',
    description: 'Microsoft AI와 Microsoft 365 제품 업데이트, 교육 현장 활용 소식을 확인하세요.',
  },
  {
    path: '/program-news',
    title: '행사 및 프로그램 소식 | Microsoft Elevate',
    description: 'Microsoft Elevate와 함께하는 교육 행사, 프로그램, 커뮤니티 소식을 확인하세요.',
  },
  {
    path: '/activity',
    title: '활동사례 알아보기 | Microsoft Elevate',
    description: 'Microsoft Elevate for Educators 커뮤니티의 교육 혁신 활동 사례와 인사이트를 영상으로 확인하세요.',
  },
  {
    path: '/agenthon',
    title: 'Agenthon | Microsoft Elevate',
    description: 'Microsoft Copilot Studio와 AI 에이전트 실습 콘텐츠를 확인하세요.',
    type: 'article',
  },
  {
    path: '/all',
    title: 'ALL Posts | Microsoft Elevate',
    description: 'Microsoft AI 교육 자료와 실습 콘텐츠를 한곳에서 확인하세요.',
  },
  {
    path: '/m365',
    title: 'M365 Posts | Microsoft Elevate',
    description: 'M365 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/copilot',
    title: 'Copilot Posts | Microsoft Elevate',
    description: 'Copilot 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/copilot-studio',
    title: 'Copilot Studio Posts | Microsoft Elevate',
    description: 'Copilot Studio 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/teams',
    title: 'Teams Posts | Microsoft Elevate',
    description: 'Teams 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/minecraft',
    title: 'Minecraft Posts | Microsoft Elevate',
    description: 'Minecraft 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/excel',
    title: 'Excel Posts | Microsoft Elevate',
    description: 'Excel 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
  {
    path: '/onenote',
    title: 'OneNote Posts | Microsoft Elevate',
    description: 'OneNote 관련 Microsoft AI 교육 자료와 실습 콘텐츠를 확인하세요.',
  },
];

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function upsertTag(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function toSafeRouteSegment(value) {
  const segment = String(value || '').trim();
  if (!/^[a-z0-9-]+$/i.test(segment)) return null;
  if (segment === '.' || segment === '..') return null;
  return segment;
}

function routePathToOutputStem(path) {
  const segments = String(path || '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean);

  if (!segments.length) return null;

  const safeSegments = segments.map(toSafeRouteSegment);
  if (safeSegments.some((segment) => !segment)) return null;

  return safeSegments.join('/');
}

function renderRouteHtml(route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const url = `${siteUrl}${route.path}`;
  const image = route.image || defaultImage;
  let html = template;

  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`,
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${route.type || 'website'}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`,
  );
  html = upsertTag(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`,
  );
  html = upsertTag(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = upsertTag(
    html,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  );
  html = upsertTag(
    html,
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  );
  return html;
}

function getStablePostImage(thumbnail) {
  const imageUrl = typeof thumbnail === 'string' ? thumbnail : thumbnail?.url;
  // Azure Blob containers are private and build-time SAS URLs expire, so prerendered
  // social metadata intentionally falls back to the stable site-level OG image.
  if (!imageUrl || imageUrl.includes('blob.core.windows.net')) return defaultImage;
  return imageUrl;
}

async function fetchPublicPostsPage(page) {
  if (!apiBaseUrl) return null;
  const url = new URL(`${apiBaseUrl}/posts`);
  url.searchParams.set('limit', '100');
  url.searchParams.set('page', String(page));
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`);
  return response.json();
}

async function collectPostRoutes() {
  if (!apiBaseUrl) {
    if (requireApiRoutes) {
      throw new Error('VITE_API_BASE_URL is required when REQUIRE_API_ROUTES=true');
    }
    return [];
  }

  const postsByRoute = new Map();
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const data = await fetchPublicPostsPage(page);
      const items = Array.isArray(data?.items) ? data.items : [];
      totalPages = Math.max(1, Number(data?.totalPages) || 1);

      for (const post of items) {
        if (!post?.category || !post?.slug || !post?.title) continue;
        const category = toSafeRouteSegment(post.category);
        const slug = toSafeRouteSegment(post.slug);
        if (!category || !slug) continue;
        const path = `/${category}/${slug}`;
        postsByRoute.set(path, {
          path,
          title: `${post.title} | Microsoft Elevate`,
          description: post.excerpt || `${post.title} - Microsoft Elevate 게시글입니다.`,
          image: getStablePostImage(post.thumbnail),
          type: 'article',
        });
      }

      page += 1;
    } while (page <= totalPages && page <= 20);
  } catch (error) {
    console.warn(`[generate-seo-routes] Skipping post detail routes: ${error.message}`);
    return [];
  }

  return Array.from(postsByRoute.values());
}

const allRoutes = [...routes, ...await collectPostRoutes()];

for (const route of allRoutes) {
  const outputStem = routePathToOutputStem(route.path);
  if (!outputStem) {
    console.warn(`[generate-seo-routes] Skipping unsafe route path: ${route.path}`);
    continue;
  }
  const routeHtml = renderRouteHtml(route);
  const directoryIndexPath = join(distDir, outputStem, 'index.html');
  const extensionlessPath = join(distDir, `${outputStem}.html`);
  mkdirSync(dirname(directoryIndexPath), { recursive: true });
  mkdirSync(dirname(extensionlessPath), { recursive: true });
  writeFileSync(directoryIndexPath, routeHtml);
  writeFileSync(extensionlessPath, routeHtml);
}
