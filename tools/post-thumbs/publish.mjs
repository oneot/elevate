#!/usr/bin/env node
/**
 * AI가 만든 썸네일을 PR로 올리거나, 실패를 이슈로 알린다 (GitHub Actions 'Post thumbnails'의 publish 단계).
 * 환경 변수:
 *   ITEMS       plan 단계의 items (JSON 배열: { key, id, title, reason: new | edited | manual })
 *   ARTIFACTS   generate 단계 아티팩트를 내려받은 폴더 (아티팩트 이름 thumb-<id>, 저장소 기준 경로 유지)
 *   FEEDBACK    다시 만들 때 받은 요청 (PR 본문에 남긴다)
 *   RUN_URL     이 실행의 주소
 *   GITHUB_TOKEN, GITHUB_REPOSITORY
 *   DRY_RUN=1   아무것도 올리지 않고 할 일과 PR 본문만 출력한다 (로컬 점검용)
 * 이 단계는 생성 단계(AI 실행)와 분리된 job에서만 저장소에 쓰기 권한을 가진다.
 * 아티팩트 파일은 다시 검사하고, 장면 파일·글 버전 기록·WebP 두 장만 커밋한다.
 * 연(또는 갱신한) PR 목록을 step 출력 prs로 남긴다. 다음 merge 단계(merge.mjs)가 검사 후 자동으로 병합한다.
 */
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { AUTOMATION_API, REPO_ROOT, SITE_URL, parseKey, thumbPaths } from './lib/posts.mjs'
import { BRANCH_PREFIX, FAILURE_LABEL, MERGE_BLOCKED_LABEL, PR_LABEL, checkScene, checkWebps, failureTitle } from './lib/pipeline.mjs'
import { ensureLabel, github, repository } from './lib/github.mjs'
import { writeExcerpt } from './lib/excerpt.mjs'

const items = JSON.parse(process.env.ITEMS || '[]')
const artifacts = process.env.ARTIFACTS || join(REPO_ROOT, 'artifacts')
const feedback = (process.env.FEEDBACK || '').trim()
const runUrl = process.env.RUN_URL || ''
const dryRun = process.env.DRY_RUN === '1'
const repo = repository()
const owner = repo.split('/')[0]
const BOT = ['-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com']

const git = (...args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' }).trim()
const summary = (line) => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`) }

function readArtifact(item) {
  const paths = thumbPaths(item.key)
  // 아티팩트를 여러 개 받으면 thumb-<id>/ 아래에, 하나만 받으면 내려받은 폴더에 바로 풀릴 수 있다.
  const dir = [join(artifacts, `thumb-${item.id}`), artifacts].find((base) => existsSync(join(base, paths.scene))) || join(artifacts, `thumb-${item.id}`)
  const files = Object.fromEntries(Object.entries(paths).map(([name, path]) => [name, join(dir, path)]))
  if (!Object.values(files).every((file) => existsSync(file))) return null
  const source = JSON.parse(readFileSync(files.source, 'utf8'))
  const problems = [
    ...checkScene(readFileSync(files.scene, 'utf8'), item.key),
    ...checkWebps({ large: readFileSync(files.large), small: readFileSync(files.small) }),
    ...(source.key === item.key && /^sha256:[0-9a-f]{64}$/.test(source.contentHash || '') ? [] : ['글 버전 기록이 올바르지 않습니다.']),
  ]
  if (problems.length) throw new Error(`${item.key} 아티팩트 검사 실패: ${problems.join(' / ')}`)
  const note = join(dir, `tools/post-thumbs/work/${item.id}/summary.md`)
  return { paths, files, source, note: existsSync(note) ? readFileSync(note, 'utf8').trim() : '' }
}

const TITLES = { new: '썸네일', edited: '썸네일 새 버전', manual: '썸네일 다시 만들기' }
const REASONS = { new: '새로 게시된 글', edited: '글 내용(제목·요약·본문)이 바뀜', manual: '수동 실행으로 다시 만들기' }

function prBody(item, sha, note, paths, previousSha, excerpt) {
  const { category, slug } = parseKey(item.key)
  const raw = (ref) => `https://raw.githubusercontent.com/${repo}/${ref}/${paths.large}`
  const image = previousSha
    ? ['| 지금 | 새 버전 |', '| --- | --- |', `| ![지금 썸네일](${raw(previousSha)}) | ![새 썸네일](${raw(sha)}) |`].join('\n')
    : `![${item.title} 썸네일](${raw(sha)})`
  const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  return [
    `## ${item.title}`,
    '',
    image,
    '',
    '| | |',
    '| --- | --- |',
    `| 게시글 | [${SITE_URL}/${item.key}](${SITE_URL}/${item.key}) |`,
    `| 만든 이유 | ${REASONS[item.reason] || REASONS.new} |`,
    `| 요약(AI) | ${excerpt?.text ? `${cell(excerpt.text)} — ${cell(excerpt.note)}` : `없음 — ${cell(excerpt?.note || '기재하지 않음')}`} |`,
    `| 장면 파일 | \`${paths.scene}\` |`,
    runUrl ? `| 만든 실행 | [Actions 실행](${runUrl}) (AI 작업 기록은 아티팩트 \`log-${item.id}\`) |` : null,
    feedback ? `| 반영한 요청 | ${cell(feedback)} |` : null,
    '',
    '### AI 설명',
    '',
    note || '(설명 없음)',
    '',
    '### 확인과 반영',
    '',
    '- 이 PR 브랜치에서 Repository checks가 통과하면 자동으로 병합합니다. 그다음 공개 사이트(`Deploy to GitHub Pages`)와 관리자(`Sync post thumbnails to admin`) 배포가 실행됩니다.',
    `- 검사에 실패하거나 병합할 수 없으면 병합하지 않고 라벨 \`${MERGE_BLOCKED_LABEL}\`과 댓글로 알립니다. 확인한 뒤 직접 병합하거나 닫으세요.`,
    '- 저장소 변수 `THUMBNAIL_AUTO_MERGE`가 `false`이면 자동 병합하지 않습니다. 사람이 확인해 병합하면 배포는 그대로 실행됩니다.',
    `- 다시 만들려면 Actions → **Post thumbnails** → Run workflow에서 \`key\`에 \`${category}/${slug}\`, \`feedback\`에 바라는 점을 적어 실행하세요. 열려 있는 PR은 새 썸네일로 바뀌고, 이미 병합됐으면 새 PR이 열려 같은 방식으로 병합됩니다.`,
    '- 병합된 썸네일을 빼려면 병합 커밋을 되돌리는(revert) PR을 올리세요.',
  ].filter((line) => line !== null).join('\n')
}

async function closeFailureIssue(item, message) {
  const issues = await github('GET', `/repos/${repo}/issues?state=open&labels=${FAILURE_LABEL}&per_page=100`)
  for (const issue of issues.filter((entry) => entry.title === failureTitle(item.key))) {
    await github('POST', `/repos/${repo}/issues/${issue.number}/comments`, { body: message })
    await github('PATCH', `/repos/${repo}/issues/${issue.number}`, { state: 'closed', state_reason: 'completed' })
  }
}

async function openPullRequest(item, artifact, excerpt) {
  const branch = `${BRANCH_PREFIX}${item.key}`
  if (dryRun) {
    const previous = item.reason === 'new' ? null : '<main sha>'
    console.log(`[dry run] ${branch}에 ${Object.values(artifact.paths).join(', ')}를 커밋하고 PR을 엽니다.\n${prBody(item, '<sha>', artifact.note, artifact.paths, previous, excerpt)}`)
    return
  }
  git('fetch', '--quiet', 'origin', 'main')
  const mainSha = git('rev-parse', 'origin/main')
  let previousSha = null
  try {
    git('cat-file', '-e', `${mainSha}:${artifact.paths.large}`)
    previousSha = mainSha
  } catch {
    // main에 아직 이 글의 이미지가 없다 (새 글).
  }
  git('switch', '--quiet', '--force-create', branch, 'origin/main')
  for (const [name, path] of Object.entries(artifact.paths)) {
    mkdirSync(dirname(join(REPO_ROOT, path)), { recursive: true })
    copyFileSync(artifact.files[name], join(REPO_ROOT, path))
  }
  git('add', '--', ...Object.values(artifact.paths))
  const subject = previousSha ? `Update thumbnail for ${item.key}` : `Add thumbnail for ${item.key}`
  execFileSync('git', [...BOT, 'commit', '--quiet', '-m', subject, '-m', `${item.title}\n\n${runUrl}`.trim()], { cwd: REPO_ROOT })
  const sha = git('rev-parse', 'HEAD')
  git('push', '--quiet', '--force', 'origin', `HEAD:refs/heads/${branch}`)
  git('switch', '--quiet', '--detach', 'origin/main')

  const body = prBody(item, sha, artifact.note, artifact.paths, previousSha, excerpt)
  const [open] = await github('GET', `/repos/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`)
  let pr = open
  if (pr) {
    await github('PATCH', `/repos/${repo}/pulls/${pr.number}`, { body })
    const why = item.reason === 'edited' ? '글 내용이 바뀌어' : '요청으로'
    await github('POST', `/repos/${repo}/issues/${pr.number}/comments`, { body: `${why} 새 썸네일로 바꿨습니다${feedback ? ` (요청: ${feedback})` : ''}. 본문의 이미지를 확인해 주세요.` })
  } else {
    try {
      pr = await github('POST', `/repos/${repo}/pulls`, { title: `${TITLES[item.reason] || TITLES.new}: ${item.title}`, head: branch, base: 'main', body, maintainer_can_modify: true })
    } catch (error) {
      if (error.status !== 403) throw error
      // 저장소 설정 'Allow GitHub Actions to create and approve pull requests'가 꺼져 있으면 PR을 만들 수 없다.
      const compare = `https://github.com/${repo}/compare/main...${encodeURIComponent(branch)}?expand=1`
      throw new Error(`PR을 만들 권한이 없습니다. 저장소 설정에서 Actions의 PR 생성을 허용하거나, 브랜치로 직접 PR을 여세요: ${compare}`)
    }
    await ensureLabel(PR_LABEL, 'AI가 만든 게시글 썸네일', '0e8a16')
    await github('POST', `/repos/${repo}/issues/${pr.number}/labels`, { labels: [PR_LABEL] })
  }
  await closeFailureIssue(item, `썸네일을 만들었습니다: #${pr.number}`)
  summary(`- ${item.key}: [#${pr.number}](${pr.html_url}) ${open ? '갱신' : '생성'}`)
  console.log(`${item.key}: ${pr.html_url}`)
  return { key: item.key, title: item.title, number: pr.number, url: pr.html_url, branch, sha }
}

async function reportFailure(item, reason) {
  if (dryRun) {
    console.log(`[dry run] 실패 이슈 '${failureTitle(item.key)}': ${reason}`)
    return
  }
  await ensureLabel(FAILURE_LABEL, '썸네일 자동 생성 실패 (닫으면 다음 실행 때 다시 시도)', 'd93f0b')
  const title = failureTitle(item.key)
  const issues = await github('GET', `/repos/${repo}/issues?state=open&labels=${FAILURE_LABEL}&per_page=100`)
  const existing = issues.find((issue) => issue.title === title)
  const detail = [
    `- 게시글: ${SITE_URL}/${item.key} (${item.title})`,
    runUrl ? `- 실행: ${runUrl} (AI 작업 기록은 아티팩트 \`log-${item.id}\`)` : null,
    `- 원인: ${reason}`,
  ].filter(Boolean).join('\n')
  if (existing) {
    await github('POST', `/repos/${repo}/issues/${existing.number}/comments`, { body: `다시 실패했습니다.\n\n${detail}` })
  } else {
    await github('POST', `/repos/${repo}/issues`, {
      title,
      labels: [FAILURE_LABEL],
      body: [
        '썸네일을 자동으로 만들지 못했습니다. 이 이슈가 열려 있는 동안에는 이 글을 자동으로 다시 시도하지 않습니다.',
        '',
        detail,
        '',
        "- 이 이슈를 닫으면 다음에 관리자에서 글을 '게시'로 저장할 때(어느 글이든) 다시 만듭니다.",
        `- 바로 다시 하려면 Actions → **Post thumbnails** → Run workflow에서 \`key\`에 \`${item.key}\`를 넣어 실행하세요.`,
      ].join('\n'),
    })
  }
  summary(`- ${item.key}: 실패 — ${reason}`)
  console.log(`${item.key}: 실패 이슈를 남겼습니다 — ${reason}`)
}

/**
 * AI 요약 한 줄을 게시글에 기재한다(서버 automation 입구, GitHub OIDC). PR보다 먼저 해서 PR 본문에 결과를 남긴다.
 * 기재하지 못해도 썸네일 PR은 그대로 연다. 버전 기록의 지문은 AI 요약으로 계산했으므로,
 * 기재하지 못한 글은 다음에 저장할 때 내용이 바뀐 것으로 보여 썸네일과 요약을 다시 만든다.
 */
async function writeItemExcerpt(item, source) {
  const text = String(source.excerpt || '').trim()
  if (dryRun) {
    console.log(`[dry run] 요약 기재: PUT ${AUTOMATION_API}/posts/${source.id}/excerpt ← ${text || '(없음)'}`)
    return { text, status: 'dry-run', note: text ? '(dry run) 게시글에 기재할 예정' : '기재하지 않음' }
  }
  const result = await writeExcerpt({ source, baseUrl: AUTOMATION_API })
  const label = { written: '기재', skipped: '건너뜀', failed: '실패' }[result.status]
  summary(`- ${item.key}: 요약 ${label} — ${result.note}`)
  console.log(`${item.key}: 요약 ${label} — ${result.note}`)
  if (result.status === 'failed') console.log(`::warning title=요약 기재 실패::${item.key} — ${result.note}`)
  return { text, ...result }
}

let failed = 0
const published = []
for (const item of items) {
  try {
    const artifact = readArtifact(item)
    if (artifact) {
      const excerpt = await writeItemExcerpt(item, artifact.source)
      const pr = await openPullRequest(item, artifact, excerpt)
      if (pr) published.push(pr)
    } else {
      await reportFailure(item, 'AI 생성 또는 검사 단계가 결과를 남기지 못했습니다.')
    }
  } catch (error) {
    failed += 1
    console.error(error.message)
    try {
      await reportFailure(item, error.message)
    } catch (reportError) {
      console.error(`실패 이슈도 남기지 못했습니다: ${reportError.message}`)
    }
  }
}
// 실패한 글은 PR이 없으므로 병합 대상에 들어가지 않는다.
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `prs=${JSON.stringify(published)}\n`)
if (failed) process.exitCode = 1
