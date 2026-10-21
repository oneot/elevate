#!/usr/bin/env node
/**
 * 이미 썸네일이 있는 글을 지금 디자인(STYLE_GUIDE)으로 한꺼번에 다시 그린다 (GitHub Actions 'Redraw post thumbnails').
 *   node redraw.mjs plan      다시 그릴 글. KEYS(쉼표)가 없으면 사람이 그린 장면(scenes/<앱>.js)으로 만든 썸네일 전부, LIMIT개까지
 *   node redraw.mjs publish   generate 결과를 브랜치 하나(thumbnail-redraw/<실행 번호>)에 모아 PR 하나로 연다.
 *                             두 번 시도해도 검사를 통과하지 못한 글은 지금 이미지를 그대로 두고 PR 본문과 실행 요약에 남긴다.
 *   node redraw.mjs merge     그 PR을 'Post thumbnails'와 같은 방식(merge.mjs)으로 검사·병합하고 배포를 한 번 실행한다.
 * 생성·검사(prepare → Copilot CLI → validate)는 workflow의 generate job이 'Post thumbnails'와 같은 단계로 한다.
 * AI 요약은 게시글에 기재하지 않고 버전 기록에도 넣지 않는다(generate의 THUMBNAIL_EXCERPT=off). 기존 요약은 그대로 둔다.
 * 환경 변수:
 *   KEYS, LIMIT                plan
 *   ITEMS, ARTIFACTS, RESULTS  publish (plan 출력, 내려받은 thumb-<id>·result-<id> 아티팩트 폴더)
 *   PRS                        merge (publish 출력)
 *   RUN_URL, GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_OUTPUT, GITHUB_STEP_SUMMARY
 *   DRY_RUN=1                  publish·merge가 아무것도 올리거나 바꾸지 않고 할 일만 출력한다 (로컬 점검용)
 */
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { REPO_ROOT, SITE_URL, fetchPublishedPosts, thumbPaths } from './lib/posts.mjs'
import {
  PR_LABEL, REDRAW_BRANCH_PREFIX, REDRAW_KEY, checkScene, checkWebps, redrawPrBody, redrawPrProblem, redrawTargets, unexpectedChanges,
} from './lib/pipeline.mjs'
import { ensureLabel, github, repository } from './lib/github.mjs'
import { mergeThumbnails } from './merge.mjs'

const MINUTE = 60_000
const BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']
const dryRun = process.env.DRY_RUN === '1'
const git = (...args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
const output = (name, value) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`) }
const summary = (lines) => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`) }

async function plan() {
  const posts = await fetchPublishedPosts()
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : 80
  const items = redrawTargets({
    posts,
    keys: process.env.KEYS || '',
    limit,
    hasThumb: (key) => existsSync(join(REPO_ROOT, thumbPaths(key).large)),
    hasAiScene: (key) => existsSync(join(REPO_ROOT, thumbPaths(key).scene)),
  })
  output('items', JSON.stringify(items))
  output('count', String(items.length))
  const lines = items.map((item) => `- ${item.key} ${item.title}`)
  console.log(items.length ? `다시 그릴 글 ${items.length}개:\n${lines.join('\n')}` : '다시 그릴 글이 없습니다.')
  summary([`### 다시 그릴 글 ${items.length}개`, '', ...lines, ''])
}

/** generate가 올린 결과 (아티팩트 thumb-<id>). 'Post thumbnails'의 publish.mjs와 같은 검사를 다시 한다. 없으면 null. */
export function readArtifact(artifacts, item) {
  const paths = thumbPaths(item.key)
  const dir = [join(artifacts, `thumb-${item.id}`), artifacts].find((base) => existsSync(join(base, paths.scene))) || join(artifacts, `thumb-${item.id}`)
  const files = Object.fromEntries(Object.entries(paths).map(([name, path]) => [name, join(dir, path)]))
  if (!Object.values(files).every((file) => existsSync(file))) return null
  const source = JSON.parse(readFileSync(files.source, 'utf8'))
  const problems = [
    ...checkScene(readFileSync(files.scene, 'utf8'), item.key),
    ...checkWebps({ large: readFileSync(files.large), small: readFileSync(files.small) }),
    ...(source.key === item.key && /^sha256:[0-9a-f]{64}$/.test(source.contentHash || '') ? [] : ['글 버전 기록이 올바르지 않습니다.']),
    // 요약을 기재하지 않는 실행이므로, 버전 기록의 지문은 지금 요약 기준이어야 한다(AI 요약이 들어가면 다음 저장 때 다시 그린다).
    ...('excerpt' in source ? ['버전 기록에 AI 요약이 들어 있습니다(THUMBNAIL_EXCERPT=off가 아님).'] : []),
  ]
  if (problems.length) throw new Error(problems.join(' / '))
  return { paths, files }
}

export function readResult(results, item) {
  const file = [join(results, `result-${item.id}.json`), join(results, `result-${item.id}`, `result-${item.id}.json`)].find(existsSync)
  return file ? JSON.parse(readFileSync(file, 'utf8')) : null
}

async function publish() {
  const items = JSON.parse(process.env.ITEMS || '[]')
  const artifacts = process.env.ARTIFACTS || join(REPO_ROOT, 'artifacts')
  const results = process.env.RESULTS || join(REPO_ROOT, 'results')
  const runUrl = process.env.RUN_URL || ''
  const done = []
  const failed = []
  for (const item of items) {
    const result = readResult(results, item)
    try {
      const artifact = readArtifact(artifacts, item)
      if (artifact) done.push({ ...item, ...artifact, attempts: result?.attempts || 1 })
      else failed.push({ ...item, reason: result?.problems?.length ? result.problems.join(' ') : '두 번 시도해도 검사를 통과한 결과가 없습니다.' })
    } catch (error) {
      failed.push({ ...item, reason: `결과 검사 실패: ${error.message}` })
    }
  }
  const failedLines = failed.map((item) => `- ${item.key}: 지금 이미지를 둠 — ${item.reason}`)
  console.log(`다시 그린 글 ${done.length}개, 지금 이미지를 둔 글 ${failed.length}개`)
  if (failedLines.length) console.log(failedLines.join('\n'))
  summary([`### 결과: 다시 그림 ${done.length}개, 지금 이미지 유지 ${failed.length}개`, '', ...failedLines, ''])
  if (!done.length) {
    output('prs', '[]')
    return
  }

  const repo = dryRun ? (process.env.GITHUB_REPOSITORY || 'oneot/elevate') : repository()
  const branch = `${REDRAW_BRANCH_PREFIX}${process.env.GITHUB_RUN_ID || 'local'}`
  const baseSha = git('rev-parse', 'HEAD')
  const allowed = done.flatMap((item) => Object.values(item.paths))
  if (dryRun) {
    console.log(`[dry run] ${branch}에 ${done.length}개 글의 장면·버전 기록·WebP ${allowed.length}개 파일을 커밋하고 PR 하나를 엽니다.`)
    console.log(redrawPrBody({ done, failed, repo, baseSha, runUrl, site: SITE_URL, paths: thumbPaths }))
    output('prs', '[]')
    return
  }
  git('checkout', '-B', branch)
  for (const item of done) {
    for (const [name, path] of Object.entries(item.paths)) {
      const target = join(REPO_ROOT, path)
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(item.files[name], target)
    }
  }
  git('add', '--', ...allowed)
  const changed = git('status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).map((line) => line.slice(3).replace(/^"|"$/g, ''))
  const extra = unexpectedChanges(changed, allowed)
  if (extra.length) throw new Error(`허용하지 않은 파일이 바뀌었습니다: ${extra.join(', ')}`)
  const message = [
    `Redraw ${done.length} post thumbnails in the current design`,
    '',
    ...(failed.length ? [`Kept the current image of ${failed.length} posts that did not pass validation twice:`, ...failed.map((item) => `- ${item.key}`), ''] : []),
    `Run: ${runUrl}`,
  ].join('\n')
  git(...BOT, 'commit', '--quiet', '-m', message)
  const headSha = git('rev-parse', 'HEAD')
  git('push', '--quiet', '--force', 'origin', `HEAD:refs/heads/${branch}`)

  const title = `썸네일 다시 그리기: ${done.length}개${failed.length ? ` (${failed.length}개는 지금 이미지 유지)` : ''}`
  const body = redrawPrBody({ done, failed, repo, baseSha, headSha, runUrl, site: SITE_URL, paths: thumbPaths })
  const pr = await github('POST', `/repos/${repo}/pulls`, { title, head: branch, base: 'main', body })
  try {
    await ensureLabel(PR_LABEL, 'AI가 만든 게시글 썸네일', '8a63d2')
    await github('POST', `/repos/${repo}/issues/${pr.number}/labels`, { labels: [PR_LABEL] })
  } catch (error) {
    console.log(`라벨을 붙이지 못했습니다(무시): ${error.message}`)
  }
  console.log(`PR #${pr.number} ${pr.html_url}`)
  summary([`- PR: [#${pr.number}](${pr.html_url}) (${branch})`, ''])
  output('prs', JSON.stringify([{ key: REDRAW_KEY, title, number: pr.number, url: pr.html_url, branch, sha: headSha }]))
}

async function merge() {
  const prs = JSON.parse(process.env.PRS || '[]')
  if (dryRun) {
    for (const pr of prs) console.log(`[dry run] #${pr.number} ${pr.branch}: ${redrawPrProblem(pr) || '검사 통과 후 병합, 배포 한 번'}`)
    return
  }
  const timeoutMinutes = Number(process.env.CHECKS_TIMEOUT_MINUTES) > 0 ? Number(process.env.CHECKS_TIMEOUT_MINUTES) : 30
  const result = await mergeThumbnails({
    prs, api: github, repo: repository(), runUrl: process.env.RUN_URL || '', timeoutMs: timeoutMinutes * MINUTE, checkPr: redrawPrProblem,
  })
  const lines = [
    ...result.merged.map((pr) => `- [#${pr.number}](${pr.url}) 자동 병합 ${pr.mergeSha || ''}`.trim()),
    ...result.blocked.map((pr) => `- [#${pr.number}](${pr.url}) 병합하지 않음 — ${pr.reason}`),
    ...result.skipped.map((pr) => `- [#${pr.number}](${pr.url}) 건너뜀 — ${pr.reason}`),
    ...(result.deployed.length ? [`- 배포 실행: ${result.deployed.join(', ')}`] : []),
    ...result.errors.map((error) => `- 오류: ${error}`),
  ]
  summary(['### 자동 병합', '', ...lines, ''])
  console.log(lines.join('\n') || '병합할 PR이 없습니다.')
  if (result.blocked.length || result.errors.length) process.exitCode = 1
}

const COMMANDS = { plan, publish, merge }
const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const command = COMMANDS[process.argv[2]]
  if (!command) {
    console.error('사용법: node redraw.mjs plan | publish | merge')
    process.exitCode = 1
  } else {
    command().catch((error) => {
      console.error(error.message || error)
      process.exitCode = 1
    })
  }
}
