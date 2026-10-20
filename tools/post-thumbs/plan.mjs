#!/usr/bin/env node
/**
 * 썸네일을 만들 글을 고른다 (GitHub Actions 'Post thumbnails'의 plan 단계).
 *   node plan.mjs                         새 글(썸네일 없음)과 내용이 바뀐 글 (최대 MAX_PER_RUN개, 기본 2)
 *   FORCE_KEY=<앱>/<slug> node plan.mjs   그 글을 다시 만든다
 *
 * 내용이 바뀌었는지는 sources/<앱>/<slug>.json(썸네일을 그린 글 버전)의 지문과 지금 글의 지문을 비교한다.
 * 공개 API의 수정 시각이 기록과 같으면 본문을 받지 않고, 다르면 본문을 받아 지문을 계산한다
 * (.cache/hashes.json에 수정 시각·화면 제목·요약과 함께 남겨 다음 실행에서 다시 받지 않는다. Actions에서는 actions/cache로 이어진다.
 *  AI 요약 기재는 수정 시각을 바꾸지 않으므로 요약이 달라지면 다시 계산한다).
 * PR 브랜치(thumbnail/<앱>/<slug>)가 지금 내용으로 만든 것이면(그 뒤 저장하지 않았거나 지문이 같으면) 검토 중이거나 닫은 것이므로 다시 만들지 않는다.
 * 결과를 출력하고, Actions에서는 GITHUB_OUTPUT에 items(JSON 배열)와 count를 쓴다.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { REPO_ROOT, ROOT, contentHash, fetchPostHtml, fetchPublishedPosts, readSource, thumbPaths } from './lib/posts.mjs'
import { BRANCH_PREFIX, FAILURE_LABEL, hashCacheHit, keyFromFailureTitle, planPosts } from './lib/pipeline.mjs'
import { github, repository } from './lib/github.mjs'

const git = (...args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

/** PR 브랜치별 버전 기록: key → { exists: true, contentHash, postUpdatedAt } */
function readBranches() {
  const branches = new Map()
  let names = []
  try {
    names = git('ls-remote', '--heads', 'origin', `refs/heads/${BRANCH_PREFIX}*`)
      .split('\n').map((line) => line.split('\t')[1]).filter(Boolean).map((ref) => ref.replace('refs/heads/', ''))
    if (names.length) git('fetch', '--quiet', '--depth=1', 'origin', `+refs/heads/${BRANCH_PREFIX}*:refs/remotes/origin/${BRANCH_PREFIX}*`)
  } catch (error) {
    console.warn(`PR 브랜치를 읽지 못했습니다: ${error.message.split('\n')[0]}`)
  }
  for (const name of names) {
    const key = name.slice(BRANCH_PREFIX.length)
    let record = {}
    try {
      record = JSON.parse(git('show', `origin/${name}:${thumbPaths(key).source}`)) || {}
    } catch {
      // 버전 기록이 없는 브랜치: 내용과 상관없이 검토 중으로 본다.
    }
    branches.set(key, { exists: true, contentHash: record.contentHash || null, postUpdatedAt: record.postUpdatedAt || null })
  }
  return branches
}

async function failedKeys() {
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPOSITORY) return new Set()
  const issues = await github('GET', `/repos/${repository()}/issues?state=open&labels=${FAILURE_LABEL}&per_page=100`)
  return new Set(issues.map((issue) => keyFromFailureTitle(issue.title)).filter(Boolean))
}

const cacheFile = join(ROOT, '.cache/hashes.json')
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}

async function hashOf(post) {
  if (hashCacheHit(cache[post.key], post)) return cache[post.key].contentHash
  const hash = contentHash({ title: post.title, excerpt: post.excerpt, html: await fetchPostHtml(post) })
  cache[post.key] = { updatedAt: post.updatedAt, title: post.title, excerpt: post.excerpt, contentHash: hash }
  return hash
}

const posts = await fetchPublishedPosts()
const branches = readBranches()
const failed = await failedKeys()
const items = await planPosts({
  posts,
  stateOf: (post) => ({
    hasThumb: existsSync(join(REPO_ROOT, thumbPaths(post.key).large)),
    source: readSource(post.key),
    branch: branches.get(post.key) || { exists: false, contentHash: null },
    failed: failed.has(post.key),
    updatedAt: post.updatedAt,
  }),
  hashOf,
  force: (process.env.FORCE_KEY || '').trim(),
  max: Number(process.env.MAX_PER_RUN || 2),
})

mkdirSync(dirname(cacheFile), { recursive: true })
writeFileSync(cacheFile, `${JSON.stringify(cache, null, 2)}\n`)

const LABELS = { new: '새 글', edited: '내용 바뀜', manual: '다시 만들기 요청' }
console.log(items.length
  ? items.map((item) => `- ${item.key} (${item.title}) — ${LABELS[item.reason]}`).join('\n')
  : '썸네일을 만들 글이 없습니다.')
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `items=${JSON.stringify(items)}\ncount=${items.length}\n`)
}
