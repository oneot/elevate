export const SITE_URL = 'https://microsoft-elevate.com';
export const SITE_NAME = 'Microsoft Elevate';
export const DEFAULT_TITLE = 'Microsoft Elevate | AI for ALL';
export const DEFAULT_DESCRIPTION = '교육 현장을 위한 Microsoft AI 솔루션. M365와 Copilot으로 시작하는 모두를 위한 AI 교육 환경.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function canonicalUrl(path = '/') {
  if (!path || path === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
