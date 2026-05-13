// PostList 탭 네비게이션용 (all 포함, MEE 제외 - 홈 화면 전용)
export const POST_LIST_CATEGORIES = ['all', 'm365', 'copilot', 'teams', 'minecraft', 'excel', 'onenote'];

// PostDetail 카테고리 검증용 (update/m365update 포함, all 제외)
export const POST_DETAIL_VALID_CATEGORIES = ['m365', 'copilot', 'teams', 'minecraft', 'excel', 'onenote', 'm365update', 'update', 'mee', 'agenthon'];

export const BASE_CATEGORIES = ['m365', 'copilot', 'teams', 'minecraft', 'excel', 'onenote'];

export const CATEGORY_DISPLAY_NAMES = {
  all: 'ALL',
  m365: 'M365',
  copilot: 'Copilot',
  teams: 'Teams',
  minecraft: 'Minecraft',
  excel: 'Excel',
  onenote: 'OneNote',
  mee: 'MEE',
  agenthon: 'Agenthon',
  m365update: 'Microsoft365 Update',
  update: '업데이트',
};

/**
 * 카테고리별 실제 목록/랜딩 페이지 경로.
 * PostDetail의 breadcrumb과 useSeriesNavigation의 backToListHref에 사용한다.
 * - POST_LIST_CATEGORIES에 속하는 카테고리는 /:category (PostList)
 * - update → /update (Microsoft365Update 전용 라우트)
 * - agenthon → /agenthon (최신 게시글 전용 라우트)
 * - mee, m365update 등 전용 라우트가 없는 카테고리는 홈(/)으로 fallback
 */
export const CATEGORY_LIST_ROUTES = {
  update: '/update',
  agenthon: '/agenthon',
};

/**
 * 카테고리의 실제 목록/랜딩 경로를 반환한다.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryListRoute(category) {
  if (!category) return '/';
  if (CATEGORY_LIST_ROUTES[category]) return CATEGORY_LIST_ROUTES[category];
  if (POST_LIST_CATEGORIES.includes(category)) return `/${category}`;
  return '/';
}
