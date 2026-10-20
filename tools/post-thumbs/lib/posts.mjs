/**
 * 공개 사이트에 게시된 글을 공개 API에서 읽어, 공개 사이트와 같은 앱·제목·요약으로 바꾼다.
 * 앱과 화면 문구는 Elevate.Web/src/constants/categories.js(toDisplayPost)를 그대로 써서 주소 <앱>/<slug>가 공개 사이트와 같다.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASE_CATEGORIES, toDisplayPost } from '../../../Elevate.Web/src/constants/categories.js'
import { getDisplayExcerpt } from '../../../Elevate.Web/src/constants/postText.js'

/** tools/post-thumbs (끝 '/' 없음). */
export const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
export const REPO_ROOT = resolve(ROOT, '../..')
export const THUMBS_DIR = join(REPO_ROOT, 'Elevate.Web/src/assets/post-thumbs')
export const PUBLIC_API = (process.env.ELEVATE_PUBLIC_API || 'https://func-elv-server-ep-dev.azurewebsites.net/api/public').replace(/\/$/, '')
/** AI 요약을 게시글에 기재하는 서버 입구 (GitHub OIDC 인증). 기본은 공개 API 주소의 /public을 /automation으로 바꾼 것. */
export const AUTOMATION_API = (process.env.ELEVATE_AUTOMATION_API || PUBLIC_API.replace(/\/public$/, '/automation')).replace(/\/$/, '')
export const SITE_URL = 'https://microsoft-elevate.com'

/** 공개 블로그의 13개 앱 (Elevate.Web POST_LIST_CATEGORIES에서 'all' 제외). */
export const APPS = ['m365', 'copilot', 'copilot-studio', 'teams', 'onenote', 'forms', 'onedrive', 'powerpoint', 'excel', 'word', 'minecraft', 'github', 'azure']

const KEY_PATTERN = /^([a-z0-9-]+)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/

/** '<앱>/<slug>' 형식을 검사해 { category, slug, id }로 나눈다. id는 파일·아티팩트 이름에 쓴다 ('/' 대신 '__'). */
export function parseKey(key) {
  const match = KEY_PATTERN.exec(String(key || '').trim())
  if (!match || !APPS.includes(match[1])) throw new Error(`잘못된 key: ${key} (<앱>/<slug>, 앱은 ${APPS.join(', ')})`)
  return { key: `${match[1]}/${match[2]}`, category: match[1], slug: match[2], id: `${match[1]}__${match[2]}` }
}

/**
 * 생성 결과 파일의 저장소 기준 경로.
 * source는 썸네일을 그린 글 버전 기록이다 (본문이 바뀌었는지 판단하는 데 쓴다).
 */
export function thumbPaths(key) {
  const { category, slug } = parseKey(key)
  return {
    scene: `tools/post-thumbs/scenes/auto/${category}/${slug}.js`,
    source: `tools/post-thumbs/sources/${category}/${slug}.json`,
    large: `Elevate.Web/src/assets/post-thumbs/${category}/${slug}-960.webp`,
    small: `Elevate.Web/src/assets/post-thumbs/${category}/${slug}-480.webp`,
  }
}

/** 저장소에 있는 버전 기록. 없으면 null. */
export function readSource(key, root = REPO_ROOT) {
  const file = join(root, thumbPaths(key).source)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`)
  return res.json()
}

/** 공개 API 응답 한 건을 공개 사이트 표시 기준 요약으로 바꾼다. */
export function toPublicPost(raw) {
  const post = toDisplayPost(raw)
  return {
    key: `${post.category}/${post.slug}`,
    id: raw.id || null,
    category: post.category,
    apiCategory: raw.category,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    serverTitle: raw.title,
    date: (raw.publishedAt || '').slice(0, 10),
    updatedAt: raw.updatedAt || null,
  }
}

/** 13개 앱의 게시된 글 전체 (공개 API 순서: 최신 게시순). */
export async function fetchPublishedPosts() {
  const items = []
  for (let page = 1; page <= 20; page += 1) {
    const qs = new URLSearchParams({ categories: BASE_CATEGORIES.join(','), limit: '100', page: String(page) })
    const data = await getJson(`${PUBLIC_API}/posts?${qs}`)
    if (!Array.isArray(data?.items)) throw new Error('공개 API 응답에 items가 없습니다.')
    items.push(...data.items)
    if (page >= (data.totalPages || 1)) break
  }
  return items.map(toPublicPost).filter((post) => APPS.includes(post.category))
}

/** render.html이 쓰는 data/posts.json을 만든다. */
export function writePostsData(posts) {
  const file = join(ROOT, 'data/posts.json')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(posts, null, 2)}\n`)
  return file
}

export async function fetchPostHtml(post) {
  const data = await getJson(`${PUBLIC_API}/posts/${encodeURIComponent(post.apiCategory)}/${encodeURIComponent(post.slug)}`)
  return data.contentMarkdown || ''
}

/**
 * 글 내용의 지문: 공개 사이트에 보이는 제목·요약과 본문 전체(정리한 글자)의 SHA-256.
 * 이미지 주소의 서명·공백 차이, 게시 상태 변경은 지문을 바꾸지 않는다.
 */
export function contentHash({ title, excerpt, html }) {
  const body = htmlToOutline(html, { maxLength: Infinity, maxCodeLines: Infinity })
  const digest = createHash('sha256').update(JSON.stringify([title || '', excerpt || '', body])).digest('hex')
  return `sha256:${digest}`
}

/**
 * AI 요약을 게시글에 기재한 뒤의 지문. plan이 공개 API에서 다시 계산할 값과 같도록,
 * 요약도 공개 사이트에 보이는 문구(postText.js: 서버 원래 문구와 같을 때만 다듬은 부제목)로 바꿔 계산한다.
 * @param {{ title: string, html: string }} content  prepare가 쓴 work/<id>/content.json (title은 화면 제목)
 */
export function hashWithExcerpt(content, excerpt) {
  return contentHash({ title: content.title, excerpt: getDisplayExcerpt({ excerpt }) || '', html: content.html })
}

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
}

const inline = (html) => decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/[ \t\u00a0]+/g, ' ').trim()

/**
 * 본문 HTML을 AI가 읽기 쉬운 마크다운 비슷한 글로 바꾼다.
 * 제목은 #, 목록은 -, 표는 | 로, 코드는 앞 12줄만, 이미지는 [이미지: 대체 텍스트]로 남긴다.
 */
export function htmlToOutline(html, { maxLength = 24000, maxCodeLines = 12 } = {}) {
  let depth = 0
  let text = String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
      const lines = decode(code.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/\n+$/, '').split('\n')
      const rest = lines.length > maxCodeLines ? `\n… (코드 ${lines.length - maxCodeLines}줄 더 있음)` : ''
      return `\n\n\`\`\`\n${lines.slice(0, maxCodeLines).join('\n')}${rest}\n\`\`\`\n\n`
    })
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const alt = /\balt\s*=\s*"([^"]*)"/i.exec(tag)?.[1]?.trim()
      return alt ? `\n[이미지: ${alt}]\n` : '\n[이미지]\n'
    })
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, body) => `\n\n${'#'.repeat(Math.min(Number(level), 4))} ${inline(body)}\n\n`)
    // 하위 목록은 들여쓰기로 남긴다.
    .replace(/<(\/?)(ul|ol|li)\b[^>]*>/gi, (_, close, tag) => {
      if (tag.toLowerCase() === 'li') return close ? '\n' : `\n${'  '.repeat(Math.max(0, depth - 1))}- `
      depth = close ? Math.max(0, depth - 1) : depth + 1
      return '\n'
    })
    .replace(/<\/(td|th)>/gi, ' | ')
    .replace(/<tr[^>]*>/gi, '\n| ')
    .replace(/<blockquote[^>]*>/gi, '\n> ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|table|blockquote|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  text = decode(text)
    .split('\n')
    // 목록 항목의 들여쓰기(앞 공백)만 두고, 나머지 공백은 하나로 줄인다.
    .map((line) => {
      const text = line.trim().replace(/[ \t\u00a0]+/g, ' ')
      return text.startsWith('- ') ? /^ */.exec(line)[0] + text : text
    })
    .join('\n')
    .replace(/^( *- |> )\n+/gm, '$1')
    .replace(/(^ *- .*)\n\n+(?= *- )/gm, '$1\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (text.length > maxLength) text = `${text.slice(0, maxLength)}\n\n… (본문이 길어 ${text.length - maxLength}자를 생략함)`
  return text
}
