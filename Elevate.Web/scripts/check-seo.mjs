import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const siteUrl = 'https://microsoft-elevate.com';
const requiredSitemapUrls = [
  '/',
  '/update',
  '/program-news',
  '/activity',
  '/agenthon',
  '/all',
  '/m365',
  '/copilot',
  '/copilot-studio',
  '/teams',
  '/minecraft',
  '/excel',
  '/onenote',
];

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const indexHtml = read('index.html');

assert(indexHtml.includes('<html lang="ko">'), 'index.html must declare Korean language');
assert(indexHtml.includes('<meta name="description"'), 'index.html must include meta description');
assert(indexHtml.includes(`<link rel="canonical" href="${siteUrl}/"`), 'index.html must include canonical URL');
assert(indexHtml.includes(`<meta property="og:url" content="${siteUrl}/"`), 'index.html must include og:url');
assert(indexHtml.includes('<meta property="og:locale" content="ko_KR"'), 'index.html must include Korean OG locale');
assert(indexHtml.includes(`<meta property="og:image" content="${siteUrl}/og-image.png"`), 'index.html must use absolute OG image URL');
assert(indexHtml.includes('<meta name="twitter:card" content="summary_large_image"'), 'index.html must include Twitter card');

assert(existsSync(resolve(root, 'public/robots.txt')), 'public/robots.txt must exist');
const robotsTxt = read('public/robots.txt');
assert(robotsTxt.includes('User-agent: *'), 'robots.txt must define a wildcard user agent');
assert(robotsTxt.includes('Allow: /'), 'robots.txt must allow crawling');
assert(robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt must point to sitemap.xml');

assert(existsSync(resolve(root, 'public/sitemap.xml')), 'public/sitemap.xml must exist');
const sitemapXml = read('public/sitemap.xml');
assert(sitemapXml.includes('<urlset'), 'sitemap.xml must contain a urlset');
for (const path of requiredSitemapUrls) {
  assert(
    sitemapXml.includes(`<loc>${siteUrl}${path === '/' ? '/' : path}</loc>`),
    `sitemap.xml must include ${path}`,
  );
}

const homePage = read('src/pages/Home.jsx');
const seoConstants = read('src/constants/seo.js');
assert(seoConstants.includes(`export const SITE_URL = '${siteUrl}';`), 'SEO constants must define the production site URL');
assert(seoConstants.includes('export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;'), 'SEO constants must define the deployed OG image URL');
assert(!homePage.includes('elevate-og.png'), 'Home Helmet must not reference missing elevate-og.png');
assert(homePage.includes('DEFAULT_OG_IMAGE'), 'Home Helmet must use the shared deployed OG image constant');

for (const page of [
  'src/pages/PostList.jsx',
  'src/pages/Microsoft365Update.jsx',
  'src/pages/ProgramNews.jsx',
  'src/pages/ActivityShowcasePage.jsx',
]) {
  const source = read(page);
  assert(source.includes("from 'react-helmet-async'") || source.includes('from "react-helmet-async"'), `${page} must import Helmet`);
  assert(source.includes('<Helmet>'), `${page} must render Helmet metadata`);
}
