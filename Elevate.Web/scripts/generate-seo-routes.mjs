import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const siteUrl = 'https://microsoft-elevate.com';
const distDir = join(process.cwd(), 'dist');
const templatePath = join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf8');
const defaultImage = `${siteUrl}/og-image.png`;

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
  return value
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

function renderRouteHtml(route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const url = `${siteUrl}${route.path}`;
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
    `<meta property="og:image" content="${defaultImage}" />`,
  );
  html = upsertTag(
    html,
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${defaultImage}" />`,
  );
  return html;
}

for (const route of routes) {
  const routeHtml = renderRouteHtml(route);
  const directoryIndexPath = join(distDir, route.path.replace(/^\//, ''), 'index.html');
  const extensionlessPath = join(distDir, `${route.path.replace(/^\//, '')}.html`);
  mkdirSync(dirname(directoryIndexPath), { recursive: true });
  mkdirSync(dirname(extensionlessPath), { recursive: true });
  writeFileSync(directoryIndexPath, routeHtml);
  writeFileSync(extensionlessPath, routeHtml);
}
