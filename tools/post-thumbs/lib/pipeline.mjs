/**
 * 생성 파이프라인의 순수 함수 (단위 테스트 대상).
 * - 어떤 글의 썸네일을 만들지 고르기
 * - AI가 쓴 장면 파일과 WebP 결과 검사
 * - 썸네일 PR을 자동으로 병합할지 정하기
 */
import { parseKey } from './posts.mjs'

export const FAILURE_LABEL = 'thumbnail-failed'
export const PR_LABEL = 'thumbnail'
export const BRANCH_PREFIX = 'thumbnail/'
/** 자동 병합하지 못한 썸네일 PR에 붙이는 라벨 (사람이 확인한다). */
export const MERGE_BLOCKED_LABEL = 'thumbnail-merge-blocked'
/** 병합 전에 PR 브랜치에서 실행하는 저장소 검사 ('Repository checks'). */
export const CHECKS_WORKFLOW = 'web-checks.yml'
/** 병합한 뒤 실행하는 배포. GITHUB_TOKEN으로 병합한 커밋은 push 이벤트로 이 workflow들을 깨우지 않는다. */
export const DEPLOY_WORKFLOWS = ['deploy.yml', 'sync-admin-thumbnails.yml']

export const failureTitle = (key) => `썸네일 자동 생성 실패: ${key}`

/** 'Redraw post thumbnails'가 결과를 모으는 브랜치 (thumbnail-redraw/<실행 번호>). plan이 읽는 thumbnail/<key> 브랜치와 겹치지 않는다. */
export const REDRAW_BRANCH_PREFIX = 'thumbnail-redraw/'
/** 한꺼번에 다시 그리기의 PR 하나를 가리키는 key (merge.mjs가 로그에 쓴다). */
export const REDRAW_KEY = 'redraw'

/** 실패 이슈 제목에서 key를 꺼낸다. 형식이 다르면 null. */
export function keyFromFailureTitle(title) {
  const match = /^썸네일 자동 생성 실패: (\S+)$/.exec(String(title || '').trim())
  return match ? match[1] : null
}

/**
 * 글 하나를 지금 그릴지 정한다 (순수 함수).
 * @param {{
 *   hasThumb: boolean,                      main에 공개 사이트 이미지가 있는지
 *   source: { contentHash: string, postUpdatedAt: string|null } | null,  main의 버전 기록
 *   branch: { exists: boolean, contentHash: string|null, postUpdatedAt?: string|null },  PR 브랜치 thumbnail/<key>와 그 버전 기록
 *   failed: boolean,                        열린 실패 이슈가 있는지
 *   updatedAt: string|null,                 공개 API의 글 수정 시각
 *   currentHash?: string,                   지금 글 내용 지문 (필요할 때만 계산해 다시 부른다)
 * }} state
 * @returns {{ reason: 'new'|'edited' } | { need: 'hash' } | null}
 */
export function classifyPost({ hasThumb, source, branch = { exists: false, contentHash: null }, failed, updatedAt, currentHash }) {
  if (failed) return null
  // 이미 만든 PR 브랜치가 지금 내용으로 만든 것이면(검토 중이거나 닫음) 다시 만들지 않는다.
  // 브랜치를 만든 뒤 글을 다시 저장하지 않았으면(수정 시각이 같으면) 지금 내용으로 만든 것이다. AI 요약 기재는 수정 시각을
  // 바꾸지 않으므로, 요약 기재가 실패해 지문이 브랜치 기록과 달라도 병합 보류·닫힌 PR의 글을 실행마다 다시 그리지 않는다.
  const branchIsCurrent = branch.exists && Boolean(updatedAt) && branch.postUpdatedAt === updatedAt
  const madeForCurrent = () => branch.exists && (!branch.contentHash || branch.contentHash === currentHash)
  if (!hasThumb) {
    if (!branch.exists) return { reason: 'new' }
    if (branchIsCurrent) return null
    if (currentHash === undefined) return { need: 'hash' }
    return madeForCurrent() ? null : { reason: 'new' }
  }
  // 버전 기록이 없는 이미지는 바뀌었는지 알 수 없으므로 건드리지 않는다.
  if (!source) return null
  if (updatedAt && source.postUpdatedAt === updatedAt) return null
  if (branchIsCurrent) return null
  if (currentHash === undefined) return { need: 'hash' }
  if (currentHash === source.contentHash) return null
  return madeForCurrent() ? null : { reason: 'edited' }
}

/**
 * plan의 지문 캐시(.cache/hashes.json) 항목을 지금 글에 다시 쓸 수 있는지.
 * 본문은 수정 시각이 같으면 같지만, AI 요약 기재는 수정 시각을 바꾸지 않으므로 화면 제목·요약까지 같아야 한다.
 */
export function hashCacheHit(entry, post) {
  return Boolean(entry?.contentHash) && entry.updatedAt === post.updatedAt && entry.title === post.title && entry.excerpt === post.excerpt
}

function toItem(post, reason) {
  const { key, id, category, slug } = parseKey(post.key)
  return { key, id, category, slug, title: post.title, reason }
}

/**
 * 한꺼번에 다시 그릴 글을 고른다 ('Redraw post thumbnails'의 plan, 순수 함수).
 * - keys(쉼표·공백으로 구분)가 있으면 그 글들. 게시돼 있고 썸네일이 있어야 한다(없는 글은 'Post thumbnails'가 만든다).
 * - 없으면 사람이 그린 장면(scenes/<앱>.js)으로 만든 썸네일 전부: 썸네일은 있는데 AI 장면(scenes/auto)이 없는 글.
 * 공개 API 순서(최신 게시순)로 limit개까지.
 * @param {{ posts: Array<object>, keys?: string, limit?: number, hasThumb: (key: string) => boolean, hasAiScene: (key: string) => boolean }} options
 * @returns {Array<{ key, id, category, slug, title, reason: 'redraw' }>}
 */
export function redrawTargets({ posts, keys = '', limit = 80, hasThumb, hasAiScene }) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error(`limit은 1 이상의 정수여야 합니다: ${limit}`)
  const wanted = [...new Set(String(keys).split(/[\s,]+/).filter(Boolean).map((key) => parseKey(key).key))]
  let chosen
  if (wanted.length) {
    const published = new Set(posts.map((post) => post.key))
    const missing = wanted.filter((key) => !published.has(key))
    if (missing.length) throw new Error(`공개 사이트에 게시된 글이 아닙니다: ${missing.join(', ')}`)
    const noThumb = wanted.filter((key) => !hasThumb(key))
    if (noThumb.length) throw new Error(`썸네일이 없는 글은 'Post thumbnails'가 만듭니다: ${noThumb.join(', ')}`)
    chosen = posts.filter((post) => wanted.includes(post.key))
  } else {
    chosen = posts.filter((post) => hasThumb(post.key) && !hasAiScene(post.key))
  }
  return chosen.slice(0, limit).map((post) => toItem(post, 'redraw'))
}

/** 'Redraw post thumbnails'가 연 PR인지 확인한다 (merge.mjs의 PR 검사를 이것으로 바꿔 쓴다). @returns {string|null} 문제가 있으면 이유 */
export function redrawPrProblem(pr) {
  if (pr?.key !== REDRAW_KEY) return `key가 ${REDRAW_KEY}가 아닙니다.`
  if (!Number.isInteger(pr.number) || pr.number < 1) return 'PR 번호가 올바르지 않습니다.'
  if (!/^thumbnail-redraw\/\d+$/.test(pr.branch || '')) return `브랜치가 ${REDRAW_BRANCH_PREFIX}<실행 번호>가 아닙니다.`
  if (!/^[0-9a-f]{40}$/.test(pr.sha || '')) return '커밋 SHA가 올바르지 않습니다.'
  return null
}

/**
 * 한꺼번에 다시 그리기 PR 본문 (순수 함수).
 * @param {{ done: Array<{ key, title, attempts? }>, failed: Array<{ key, title, reason }>, repo: string, baseSha: string, headSha?: string, runUrl?: string, paths: (key) => { large: string, small: string } }} options
 */
export function redrawPrBody({ done, failed, repo, baseSha, headSha, runUrl = '', site = 'https://microsoft-elevate.com', paths }) {
  const raw = (ref, path) => `https://raw.githubusercontent.com/${repo}/${ref}/${path}`
  const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const lines = [
    '## 썸네일 다시 그리기',
    '',
    `'Redraw post thumbnails'가 이미 썸네일이 있는 글을 지금 디자인(tools/post-thumbs/STYLE_GUIDE.md)으로 다시 그렸습니다.`,
    '생성·검사는 \'Post thumbnails\'와 같습니다. Repository checks를 통과하면 자동으로 병합하고 공개 사이트와 관리자 배포를 한 번 실행합니다.',
    '',
    '| | |',
    '| --- | --- |',
    `| 다시 그린 글 | ${done.length}개${done.some((item) => item.attempts > 1) ? ` (그중 ${done.filter((item) => item.attempts > 1).length}개는 두 번째 시도)` : ''} |`,
    `| 지금 이미지를 둔 글 | ${failed.length}개 |`,
    '| AI 요약 | 게시글에 기재하지 않고 버전 기록에도 넣지 않았습니다(기존 요약 유지) |',
    runUrl ? `| 만든 실행 | [Actions 실행](${runUrl}) (글별 AI 작업 기록은 아티팩트 \`log-<앱>__<slug>\`) |` : null,
    '',
  ]
  if (failed.length) {
    lines.push('### 지금 이미지를 둔 글', '', ...failed.map((item) => `- \`${item.key}\` ${cell(item.title || '')} — ${cell(item.reason)}`), '')
  }
  if (done.length) {
    lines.push('### 다시 그린 글', '', '| 글 | 지금 | 새 이미지 |', '| --- | --- | --- |')
    for (const item of done) {
      const { small } = paths(item.key)
      const now = `<img src="${raw(baseSha, small)}" width="240" alt="지금">`
      const next = headSha ? `<img src="${raw(headSha, small)}" width="240" alt="새 이미지">` : '(커밋 뒤 표시)'
      lines.push(`| [${cell(item.title)}](${site}/${item.key})<br>\`${item.key}\`${item.attempts > 1 ? ' (두 번째 시도)' : ''} | ${now} | ${next} |`)
    }
    lines.push('')
  }
  return lines.filter((line) => line !== null).join('\n')
}

/**
 * 썸네일을 만들 글을 고른다.
 * - force가 있으면 그 글 하나를 다시 만든다 (reason 'manual').
 * - 아니면 새 글(썸네일 없음)을 먼저, 내용이 바뀐 글을 그다음으로, 각각 최신 게시순으로 max개까지.
 * @param {{ posts: Array<object>, stateOf: (post) => object, hashOf: (post) => Promise<string>, force?: string, max?: number }} options
 * @returns {Promise<Array<{ key, id, category, slug, title, reason }>>}
 */
export async function planPosts({ posts, stateOf, hashOf, force = '', max = 2 }) {
  if (force) {
    const { key } = parseKey(force)
    const post = posts.find((item) => item.key === key)
    if (!post) throw new Error(`${key}: 공개 사이트에 게시된 글이 아닙니다.`)
    return [toItem(post, 'manual')]
  }
  const found = { new: [], edited: [] }
  for (const post of posts) {
    const state = stateOf(post)
    let verdict = classifyPost(state)
    if (verdict?.need === 'hash') verdict = classifyPost({ ...state, currentHash: await hashOf(post) })
    if (verdict?.reason) found[verdict.reason].push(toItem(post, verdict.reason))
  }
  return [...found.new, ...found.edited].slice(0, Math.max(0, max))
}

// 장면은 렌더할 때 브라우저에서만 실행되지만, 오프라인 규칙(STYLE_GUIDE 8)을 지키는지 확인한다.
const FORBIDDEN = [
  [/\bfetch\s*\(/, 'fetch()'],
  [/XMLHttpRequest|WebSocket|EventSource|sendBeacon/, '네트워크 API'],
  [/\bimport\s*\(/, '동적 import'],
  [/\beval\s*\(|new\s+Function\b/, 'eval / Function'],
  [/https?:\/\/(?!www\.w3\.org\/)/, '외부 URL'],
  [/\bdocument\.(cookie|write)\b|localStorage|sessionStorage/, '문서·저장소 접근'],
]

/** AI가 쓴 장면 파일을 검사한다. 문제 목록을 돌려준다 (없으면 빈 배열). */
export function checkScene(source, key) {
  const problems = []
  const registered = [...String(source).matchAll(/\bscene\s*\(\s*(['"`])([^'"`]+)\1/g)].map((match) => match[2])
  if (registered.length !== 1) problems.push(`scene()을 정확히 한 번 등록해야 합니다 (현재 ${registered.length}번).`)
  else if (registered[0] !== key) problems.push(`등록한 key가 '${registered[0]}'입니다. '${key}'여야 합니다.`)
  for (const [pattern, label] of FORBIDDEN) if (pattern.test(source)) problems.push(`허용하지 않는 코드: ${label}`)
  if (Buffer.byteLength(String(source)) > 40_000) problems.push('장면 파일이 40 KB를 넘습니다.')
  return problems
}

/** WebP 파일 헤더에서 크기를 읽는다 (VP8, VP8L, VP8X). WebP가 아니면 null. */
export function webpSize(buffer) {
  if (!buffer || buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null
  const chunk = buffer.toString('ascii', 12, 16)
  if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X') return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 }
  return null
}

/** 공개 카드용 WebP 두 장(960×540, 480×270)을 검사한다. */
export function checkWebps({ large, small }) {
  const problems = []
  for (const [name, buffer, width, height] of [['960', large, 960, 540], ['480', small, 480, 270]]) {
    const size = webpSize(buffer)
    if (!size) problems.push(`${name}px 파일이 WebP가 아닙니다.`)
    else if (size.width !== width || size.height !== height) problems.push(`${name}px 파일 크기가 ${size.width}×${size.height}입니다 (${width}×${height}이어야 함).`)
    else if (buffer.length > 600_000) problems.push(`${name}px 파일이 600 KB를 넘습니다.`)
  }
  return problems
}

/** 생성 결과로 바뀌어도 되는 저장소 경로인지 (그 밖의 변경은 거부한다). */
export function unexpectedChanges(changedPaths, allowedPaths) {
  const allowed = new Set(allowedPaths)
  return changedPaths.filter((path) => !allowed.has(path))
}

/** AI 요약 한 줄 규칙. 사람이 다듬은 기존 요약 80개는 33~55자(중앙값 44자)이고 모두 '~니다.'로 끝난다. */
export const EXCERPT_MIN = 25
export const EXCERPT_MAX = 70

/**
 * AI가 쓴 요약 한 줄을 검사한다 (순수 함수).
 * @returns {string[]} 문제 목록 (없으면 빈 배열)
 */
export function checkExcerpt(text, { title = '' } = {}) {
  const excerpt = String(text ?? '').trim()
  if (!excerpt) return ['요약이 비어 있습니다.']
  const problems = []
  if (/[\r\n]/.test(excerpt)) problems.push('요약은 한 줄이어야 합니다.')
  const length = [...excerpt].length
  if (length < EXCERPT_MIN || length > EXCERPT_MAX) problems.push(`요약은 ${EXCERPT_MIN}~${EXCERPT_MAX}자여야 합니다(지금 ${length}자).`)
  if (!excerpt.endsWith('니다.')) problems.push("요약은 '~니다.'로 끝나야 합니다.")
  else if ((excerpt.match(/니다\./g) || []).length > 1) problems.push('요약은 한 문장이어야 합니다.')
  if (/[<>#*`[\]|]/.test(excerpt) || /^["'“‘「]/.test(excerpt)) problems.push('요약에 마크다운·HTML·따옴표 꾸밈을 쓰지 않습니다.')
  if (title && excerpt.replace(/[\s.]/g, '') === String(title).replace(/[\s.]/g, '')) problems.push('요약이 제목과 같습니다.')
  return problems
}

/**
 * AI에게 보여 줄 요약 예시: 규칙에 맞는 기존 요약을 같은 앱에서 먼저(최신순), 모자라면 다른 앱에서 고른다.
 * @param {Array<{ key: string, category: string, title: string, excerpt: string }>} posts 공개 사이트 표시 기준 글 목록
 */
export function pickExcerptExamples(posts, { key, category, limit = 6 }) {
  const good = posts.filter((post) => post.key !== key && checkExcerpt(post.excerpt, { title: post.title }).length === 0)
  const same = good.filter((post) => post.category === category)
  const others = good.filter((post) => post.category !== category)
  return [...same, ...others].slice(0, limit).map((post) => ({ title: post.title, excerpt: post.excerpt.trim() }))
}

/**
 * publish가 넘긴 PR 정보가 이 파이프라인이 만든 썸네일 PR인지 확인한다.
 * 브랜치는 thumbnail/<key>여야 한다. 병합 뒤 그 브랜치를 지우므로 다른 브랜치를 건드리지 않게 한다.
 * @returns {string|null} 문제가 있으면 이유
 */
export function publishedPrProblem(pr) {
  try {
    const { key } = parseKey(pr?.key)
    if (!Number.isInteger(pr.number) || pr.number < 1) return 'PR 번호가 올바르지 않습니다.'
    if (pr.branch !== `${BRANCH_PREFIX}${key}`) return `브랜치가 ${BRANCH_PREFIX}${key}가 아닙니다.`
    if (!/^[0-9a-f]{40}$/.test(pr.sha || '')) return '커밋 SHA가 올바르지 않습니다.'
    return null
  } catch (error) {
    return error.message
  }
}

/** 방금 실행을 요청한 검사 run을 고른다: 같은 커밋, 요청 시각(시계 차이 허용) 이후, 가장 최근. */
export function pickChecksRun(runs, { sha, since, skewMs = 2 * 60_000 }) {
  return (runs || [])
    .filter((run) => run.head_sha === sha && Date.parse(run.created_at) >= since - skewMs)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] || null
}

const CHECK_RESULTS = {
  failure: '실패',
  cancelled: '취소됨',
  timed_out: '시간 초과',
  startup_failure: '시작 실패',
  action_required: '승인 필요',
  skipped: '건너뜀',
  neutral: '판정 없음',
  stale: '오래됨',
  not_started: '실행 요청 실패',
}

/**
 * 썸네일 PR을 지금 병합할지 정한다 (순수 함수).
 * - 이미 닫혔거나 병합된 PR은 건너뛴다.
 * - publish가 올린 커밋에서 바뀌었거나, 검사가 통과하지 않았거나, 검사한 커밋이 다르면 병합하지 않는다(사람이 확인).
 * @param {{ pr: object|null, expectedSha: string, checks: { conclusion: string, sha?: string }|null }} input
 *   pr은 GitHub의 PR 응답, checks는 'Repository checks' 결과
 * @returns {{ action: 'merge'|'block'|'skip', reason: string }}
 */
export function mergeDecision({ pr, expectedSha, checks }) {
  if (!pr || pr.state !== 'open') {
    return { action: 'skip', reason: pr?.merged ? '이미 병합된 PR입니다.' : '열려 있지 않은 PR입니다.' }
  }
  if (pr.head?.sha !== expectedSha) return { action: 'block', reason: '썸네일을 올린 뒤 PR 브랜치가 바뀌었습니다.' }
  if (!checks || checks.conclusion !== 'success') {
    const result = checks ? CHECK_RESULTS[checks.conclusion] || checks.conclusion || '알 수 없음' : '없음'
    const runs = checks?.attempts > 1 ? `, ${checks.attempts}번 실행` : ''
    return { action: 'block', reason: `Repository checks가 통과하지 않았습니다 (${result}${runs}).` }
  }
  if (checks.sha && checks.sha !== expectedSha) return { action: 'block', reason: '검사한 커밋이 PR 커밋과 다릅니다.' }
  return { action: 'merge', reason: 'Repository checks 통과' }
}
