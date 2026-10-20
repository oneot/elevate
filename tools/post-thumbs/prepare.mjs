#!/usr/bin/env node
/**
 * AI에게 줄 작업 폴더를 만든다 (GitHub Actions 'Post thumbnails'의 generate 단계 앞부분).
 *   node prepare.mjs <앱>/<slug>
 *   환경 변수: REASON(new | edited | manual, plan 결과), FEEDBACK(다시 만들 때 반영할 요청)
 * 만드는 파일:
 *   data/posts.json             렌더러가 쓰는 공개 글 목록 (새 글 포함)
 *   work/<id>/post.md           제목·요약·주소와 본문 전체
 *   work/<id>/task.md           TASK.md에 이 글의 값을 채운 AI 작업 지시
 *   work/<id>/source.json       이 썸네일을 그린 글 버전 (검사를 통과하면 sources/<앱>/<slug>.json으로 저장)
 *   work/<id>/previous-960.webp 지금 공개 사이트 썸네일 (있을 때만)
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATEGORY_DISPLAY_NAMES } from '../../Elevate.Web/src/constants/categories.js'
import {
  REPO_ROOT, ROOT, SITE_URL, contentHash, fetchPostHtml, fetchPublishedPosts, htmlToOutline, parseKey, thumbPaths, writePostsData,
} from './lib/posts.mjs'

const { key, category, slug, id } = parseKey(process.argv[2])
const feedback = (process.env.FEEDBACK || '').trim()
const reason = process.env.REASON || 'new'

const posts = await fetchPublishedPosts()
writePostsData(posts)
const post = posts.find((item) => item.key === key)
if (!post) throw new Error(`${key}: 공개 사이트에 게시된 글이 아닙니다.`)

const appName = CATEGORY_DISPLAY_NAMES[category] || category
const lines = [
  `# ${post.title}`,
  '',
  `- 앱: ${appName} (\`${category}\`)`,
  `- 공개 주소: ${SITE_URL}/${key}`,
  `- 게시일: ${post.date || '알 수 없음'}`,
  `- 요약: ${post.excerpt || '(없음)'}`,
]
if (post.serverTitle && post.serverTitle !== post.title) lines.push(`- 서버에 저장된 원래 제목: ${post.serverTitle}`)
const html = await fetchPostHtml(post)
lines.push('', '## 본문', '', htmlToOutline(html), '')

const dir = join(ROOT, 'work', id)
mkdirSync(dir, { recursive: true })
mkdirSync(join(ROOT, 'scenes/auto', category), { recursive: true })
writeFileSync(join(dir, 'post.md'), lines.join('\n'))
writeFileSync(join(dir, 'source.json'), `${JSON.stringify({
  key,
  title: post.title,
  postUpdatedAt: post.updatedAt,
  contentHash: contentHash({ title: post.title, excerpt: post.excerpt, html }),
  origin: 'ai',
}, null, 2)}\n`)

const previous = join(REPO_ROOT, thumbPaths(key).large)
const hasPrevious = existsSync(previous)
if (hasPrevious) copyFileSync(previous, join(dir, 'previous-960.webp'))
const PREVIOUS = `이 글에는 이미 썸네일이 있다: \`work/${id}/previous-960.webp\` (이전 장면은 \`scenes/${category}.js\`나 \`scenes/auto/${category}/${slug}.js\`에서 \`${key}\`로 찾는다).`
const MODES = {
  new: '처음 만드는 썸네일이다.',
  edited: `${PREVIOUS} 글 내용이 바뀌어 **새 버전**을 만든다. 바뀐 본문을 기준으로 장면을 다시 정하고, 이전 장면에서 여전히 맞는 구성은 이어 써도 된다.`,
  manual: `${hasPrevious ? `${PREVIOUS} ` : ''}다시 만들어 달라는 요청이다. 아래 '요청 사항'을 우선 반영한다.`,
}

const values = {
  KEY: key, ID: id, CATEGORY: category, SLUG: slug, APP_NAME: appName, TITLE: post.title,
  MODE: MODES[reason] || MODES.new,
  FEEDBACK: feedback || '없음',
}
const task = readFileSync(join(ROOT, 'TASK.md'), 'utf8').replace(/\{\{(\w+)\}\}/g, (match, name) => values[name] ?? match)
writeFileSync(join(dir, 'task.md'), task)
console.log(join(dir, 'task.md'))
