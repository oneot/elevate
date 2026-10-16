// PostList 탭 네비게이션용 (all 포함, MEE 제외 - 홈 화면 전용)
// word / powerpoint / forms / onedrive 는 M365에서 분리한 화면용 카테고리다 (아래 M365_SPLIT_RULES 참고).
export const POST_LIST_CATEGORIES = ['all', 'm365', 'copilot', 'copilot-studio', 'teams', 'onenote', 'forms', 'onedrive', 'powerpoint', 'excel', 'word', 'minecraft'];

// PostDetail 카테고리 검증용 (update/m365update/program-news 포함, all 제외)
export const POST_DETAIL_VALID_CATEGORIES = ['m365', 'word', 'powerpoint', 'forms', 'onedrive', 'copilot', 'copilot-studio', 'teams', 'minecraft', 'excel', 'onenote', 'm365update', 'update', 'mee', 'agenthon', 'program-news', 'event'];

// API(서버)에 실제로 저장된 블로그 카테고리
export const BASE_CATEGORIES = ['m365', 'copilot', 'copilot-studio', 'teams', 'minecraft', 'excel', 'onenote'];

export const CATEGORY_DISPLAY_NAMES = {
  all: 'ALL',
  m365: 'M365',
  word: 'Word',
  powerpoint: 'PowerPoint',
  forms: 'Forms',
  onedrive: 'OneDrive',
  copilot: 'Copilot',
  'copilot-studio': 'Copilot Studio',
  teams: 'Teams',
  minecraft: 'Minecraft',
  excel: 'Excel',
  onenote: 'OneNote',
  mee: 'MEE',
  agenthon: 'Agenthon',
  m365update: 'Microsoft365 Update',
  update: '업데이트',
  'program-news': '프로그램 소식',
  event: '행사 소식',
};

/**
 * M365에서 분리해 상위 카테고리로 보여주는 앱.
 * 서버 데이터의 category는 그대로 'm365'이고, 기존 시리즈 이름(없으면 태그)으로 앱을 구분한다.
 * 서버 데이터를 바꾸지 않으므로 운영 중인 사이트에는 영향이 없다.
 */
export const M365_SPLIT_RULES = [
  { category: 'word', series: 'Word Online 입문 가이드', tag: 'word' },
  { category: 'powerpoint', series: 'PowerPoint Online 입문 가이드', tag: 'powerpoint' },
  { category: 'forms', series: 'Forms 입문 가이드', tag: 'forms' },
  { category: 'onedrive', series: 'Onedrive 입문 가이드', tag: 'onedrive' },
];

const M365_SPLIT_KEYS = M365_SPLIT_RULES.map((rule) => rule.category);

/** 화면 카테고리를 서버 API 카테고리로 바꾼다 (예: 'forms' → 'm365'). */
export function getApiCategory(category) {
  return M365_SPLIT_KEYS.includes(category) ? 'm365' : category;
}

/** 서버 게시글이 화면에서 속하는 카테고리 (예: Forms 시리즈의 m365 글 → 'forms'). */
export function getDisplayCategory(post) {
  if (!post || post.category !== 'm365') return post?.category;
  const tags = (post.tags || []).map((tag) => String(tag).toLowerCase());
  const rule = M365_SPLIT_RULES.find((item) => item.series === post.series)
    || M365_SPLIT_RULES.find((item) => tags.includes(item.tag));
  return rule ? rule.category : 'm365';
}

/** 게시글의 category를 화면 카테고리로 바꾼 사본. */
export function withDisplayCategory(post) {
  const category = getDisplayCategory(post);
  return category === post?.category ? post : { ...post, category };
}

/** 같은 API 카테고리를 공유하는 화면 카테고리 목록 (예: 'm365' → m365, word, powerpoint, forms, onedrive). */
export function getDisplayCategoriesForApi(apiCategory) {
  return apiCategory === 'm365' ? ['m365', ...M365_SPLIT_KEYS] : [apiCategory];
}

/**
 * 카테고리별 실제 목록/랜딩 페이지 경로.
 * PostDetail의 breadcrumb·사이드바 제목과 목록으로 돌아가기 링크에 사용한다.
 * - POST_LIST_CATEGORIES에 속하는 카테고리는 /:category (PostList)
 * - update → /update (Microsoft365Update 전용 라우트)
 * - program-news → /program-news (행사 소식 전용 라우트)
 * - agenthon → /agenthon (최신 게시글 전용 라우트)
 * - mee, m365update 등 전용 라우트가 없는 카테고리는 홈(/)으로 fallback
 */
export const CATEGORY_LIST_ROUTES = {
  update: '/update',
  'program-news': '/program-news',
  event: '/program-news?tab=event',
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
