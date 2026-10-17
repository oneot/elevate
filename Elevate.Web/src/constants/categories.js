import { getDisplayExcerpt, getDisplayTitle } from './postText.js';

// PostList 탭 네비게이션용 (all 포함, MEE 제외 - 홈 화면 전용)
// word / powerpoint / forms / onedrive / github / azure 는 화면에서만 나눈 카테고리다 (아래 CATEGORY_SPLIT_RULES 참고).
export const POST_LIST_CATEGORIES = ['all', 'm365', 'copilot', 'copilot-studio', 'teams', 'onenote', 'forms', 'onedrive', 'powerpoint', 'excel', 'word', 'minecraft', 'github', 'azure'];

// PostDetail 카테고리 검증용 (update/m365update/program-news 포함, all 제외)
export const POST_DETAIL_VALID_CATEGORIES = ['m365', 'word', 'powerpoint', 'forms', 'onedrive', 'copilot', 'copilot-studio', 'teams', 'minecraft', 'excel', 'onenote', 'github', 'azure', 'm365update', 'update', 'mee', 'agenthon', 'program-news', 'event'];

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
  github: 'GitHub',
  azure: 'Azure',
  mee: 'MEE',
  agenthon: 'Agenthon',
  m365update: 'Microsoft365 Update',
  update: '업데이트',
  'program-news': '프로그램 소식',
  event: '행사 소식',
};

/**
 * 서버 카테고리(from) 안의 글 일부를 화면에서 별도 상위 카테고리로 보여 주는 규칙.
 * 서버 데이터의 category는 그대로 두고 화면에서만 나누므로 운영 데이터에는 영향이 없다.
 * 글은 slug → 기존 시리즈 이름 → 태그 순서로 맞춰 본다.
 * - Word / PowerPoint / Forms / OneDrive: M365 글을 시리즈(없으면 태그)로 나눈다.
 * - GitHub / Azure: Copilot Studio 글 중 배포·바이브 코딩 글을 slug로 옮긴다.
 */
export const CATEGORY_SPLIT_RULES = [
  { category: 'word', from: 'm365', series: 'Word Online 입문 가이드', tag: 'word' },
  { category: 'powerpoint', from: 'm365', series: 'PowerPoint Online 입문 가이드', tag: 'powerpoint' },
  { category: 'forms', from: 'm365', series: 'Forms 입문 가이드', tag: 'forms' },
  { category: 'onedrive', from: 'm365', series: 'Onedrive 입문 가이드', tag: 'onedrive' },
  {
    category: 'github',
    from: 'copilot-studio',
    slugs: ['github-pages', 'agent-to-website', 'github-copilot', 'copilot-studio-multi-model-ai-agent-github-pages'],
  },
  { category: 'azure', from: 'copilot-studio', slugs: ['secret-key-azure-function-github-pages'] },
];

/** 화면 카테고리를 서버 API 카테고리로 바꾼다 (예: 'forms' → 'm365', 'github' → 'copilot-studio'). */
export function getApiCategory(category) {
  return CATEGORY_SPLIT_RULES.find((rule) => rule.category === category)?.from || category;
}

/** 서버 게시글이 화면에서 속하는 카테고리 (예: Forms 시리즈의 m365 글 → 'forms'). */
export function getDisplayCategory(post) {
  const rules = CATEGORY_SPLIT_RULES.filter((rule) => rule.from === post?.category);
  if (!rules.length) return post?.category;
  const tags = (post.tags || []).map((tag) => String(tag).toLowerCase());
  const rule = rules.find((item) => item.slugs?.includes(post.slug))
    || rules.find((item) => item.series && item.series === post.series)
    || rules.find((item) => item.tag && tags.includes(item.tag));
  return rule ? rule.category : post.category;
}

/**
 * 화면에 보여 줄 게시글 사본: category는 화면 카테고리로, title·excerpt는 다듬은 제목·부제목으로 바꾼다
 * (constants/postText.js). 원래 서버 문구는 serverTitle·serverExcerpt에 남겨 검색과 정렬에 쓴다.
 */
export function toDisplayPost(post) {
  if (!post) return post;
  const category = getDisplayCategory(post);
  const title = getDisplayTitle(post);
  const excerpt = getDisplayExcerpt(post);
  if (category === post.category && title === post.title && excerpt === post.excerpt) return post;
  return {
    ...post,
    category,
    title,
    excerpt,
    serverTitle: post.serverTitle ?? post.title,
    serverExcerpt: post.serverExcerpt ?? post.excerpt,
  };
}

/** 같은 API 카테고리를 공유하는 화면 카테고리 목록 (예: 'm365' → m365, word, powerpoint, forms, onedrive). */
export function getDisplayCategoriesForApi(apiCategory) {
  return [
    apiCategory,
    ...CATEGORY_SPLIT_RULES.filter((rule) => rule.from === apiCategory).map((rule) => rule.category),
  ];
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
