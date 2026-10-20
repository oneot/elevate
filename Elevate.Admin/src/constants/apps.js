/**
 * 관리자 앱(게시글 분류) 모델.
 *
 * 서버에 저장되는 게시글 category는 BASE_CATEGORIES 7개다. 공개 사이트(Elevate.Web)는 그중 일부 글을
 * CATEGORY_SPLIT_RULES로 Word/PowerPoint/Forms/OneDrive(M365 글)와 GitHub/Azure(Copilot Studio 글)
 * 화면 카테고리로 나눠 보여 준다. 관리자도 같은 규칙으로 13개 앱의 목록을 만들고 새 글을 쓴다.
 * 규칙은 Elevate.Web/src/constants/categories.js와 같아야 한다 (tests/app-classification.test.js).
 */

/** 서버(API)에 실제로 저장되는 게시글 category. */
export const BASE_CATEGORIES = ['m365', 'copilot', 'copilot-studio', 'teams', 'minecraft', 'excel', 'onenote']

/** 공개 블로그 사이드바와 같은 순서의 앱 목록 (Elevate.Web POST_LIST_CATEGORIES에서 'all' 제외). */
export const APP_KEYS = [
  'm365', 'copilot', 'copilot-studio', 'teams', 'onenote', 'forms', 'onedrive',
  'powerpoint', 'excel', 'word', 'minecraft', 'github', 'azure',
]

export const ALL_APPS_KEY = 'all'

export const APP_LABELS = {
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
}

/**
 * 서버 category(from) 안의 글을 화면 앱(category)으로 나누는 규칙. 공개 사이트와 같은 순서로
 * slug → 시리즈 이름 → 태그(대소문자 무시) 순서로 맞춰 본다.
 * 관리자에서 새로 쓰는 글은 앱 태그(tag)를 붙여 같은 앱에 표시되게 한다.
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
    tag: 'github',
  },
  { category: 'azure', from: 'copilot-studio', slugs: ['secret-key-azure-function-github-pages'], tag: 'azure' },
]

const SPLIT_TAGS = new Set(CATEGORY_SPLIT_RULES.map((rule) => rule.tag).filter(Boolean))

export function isAppKey(value) {
  return APP_KEYS.includes(value)
}

export function getAppLabel(appKey) {
  if (appKey === ALL_APPS_KEY) return '전체 게시글'
  return APP_LABELS[appKey] || appKey || ''
}

/** 앱 → 서버 category (예: 'forms' → 'm365', 'github' → 'copilot-studio'). */
export function getApiCategory(appKey) {
  return CATEGORY_SPLIT_RULES.find((rule) => rule.category === appKey)?.from || appKey
}

/**
 * 게시글이 공개 사이트에서 표시되는 앱. 공개 사이트 getDisplayCategory와 같은 판단이다.
 * 관리자 목록 API 요약에는 series가 없으므로 목록에서는 slug와 태그로 판단하고,
 * 편집 화면은 series까지 포함한 전체 게시글로 판단한다.
 */
export function getDisplayCategory(post) {
  const rules = CATEGORY_SPLIT_RULES.filter((rule) => rule.from === post?.category)
  if (!rules.length) return post?.category
  const tags = (post.tags || []).map((tag) => String(tag).toLowerCase())
  const rule = rules.find((item) => item.slugs?.includes(post.slug))
    || rules.find((item) => item.series && item.series === post.series)
    || rules.find((item) => item.tag && tags.includes(item.tag))
  return rule ? rule.category : post.category
}

/** 앱의 새 글에 붙이는 태그. 서버 category와 같은 앱(M365 등)은 null. */
export function getAppTag(appKey) {
  return CATEGORY_SPLIT_RULES.find((rule) => rule.category === appKey)?.tag || null
}

/**
 * 새 글의 앱을 바꿀 때 태그를 맞춘다. 다른 앱으로 옮기는 앱 태그는 빼고, 고른 앱의 태그를 맨 앞에 둔다.
 * @param {string[]} tags
 * @param {string} appKey
 * @returns {string[]}
 */
export function applyAppTag(tags, appKey) {
  const appTag = getAppTag(appKey)
  const rest = (tags || []).filter((tag) => !SPLIT_TAGS.has(String(tag).trim().toLowerCase()))
  return appTag ? [appTag, ...rest] : rest
}
