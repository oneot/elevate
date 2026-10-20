#!/usr/bin/env node
/**
 * AI가 만든 결과를 검사하고 최종 이미지를 다시 그린다 (generate 단계 마지막).
 *   node validate.mjs <앱>/<slug>
 * - 장면 파일: scenes/auto/<앱>/<slug>.js에 이 key 하나만 등록, 네트워크·외부 URL 등 금지 코드 없음
 * - 다시 export·zoom: audit 경고와 콘솔 오류 0
 * - WebP 960×540, 480×270
 * - 통과하면 prepare가 남긴 글 버전(work/<id>/source.json)을 sources/<앱>/<slug>.json으로 저장
 *   AI 요약 한 줄(work/<id>/excerpt.txt)이 규칙에 맞으면 버전 기록에 excerpt로 남기고, 지문은 그 요약으로 다시 계산한다.
 *   publish가 이 요약을 게시글에 기재하므로, 기재된 뒤의 글 내용과 지문이 같아져 같은 내용으로 다시 만들지 않는다.
 *   요약이 없거나 규칙에 맞지 않으면 썸네일은 그대로 두고 요약만 기재하지 않는다(경고).
 * - 저장소에서 바뀐 파일이 장면·버전 기록·WebP 두 장뿐인지 (그 밖의 변경은 거부. 로컬에서 다른 작업 중이면 --no-git-check)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { REPO_ROOT, ROOT, contentHash, parseKey, thumbPaths } from './lib/posts.mjs'
import { checkExcerpt, checkScene, checkWebps, unexpectedChanges } from './lib/pipeline.mjs'
import { main as render } from './render.mjs'

const { key, id } = parseKey(process.argv[2])
const paths = thumbPaths(key)
const problems = []

const scenePath = join(REPO_ROOT, paths.scene)
if (!existsSync(scenePath)) problems.push(`${paths.scene} 파일이 없습니다.`)
else problems.push(...checkScene(readFileSync(scenePath, 'utf8'), key))

if (!problems.length) {
  if (await render(['export', key])) problems.push('export에서 audit 경고나 오류가 났습니다 (위 출력 참고).')
  if (await render(['zoom', key])) problems.push('zoom에서 audit 경고나 오류가 났습니다 (위 출력 참고).')
  const large = join(REPO_ROOT, paths.large)
  const small = join(REPO_ROOT, paths.small)
  if (!existsSync(large) || !existsSync(small)) problems.push('WebP 파일이 없습니다.')
  else problems.push(...checkWebps({ large: readFileSync(large), small: readFileSync(small) }))
}

if (!problems.length) {
  const record = join(ROOT, 'work', id, 'source.json')
  const source = existsSync(record) ? JSON.parse(readFileSync(record, 'utf8')) : null
  if (!source || source.key !== key || !String(source.contentHash || '').startsWith('sha256:')) {
    problems.push(`work/${id}/source.json(글 버전 기록)이 없거나 올바르지 않습니다. prepare.mjs를 먼저 실행하세요.`)
  } else {
    const file = join(REPO_ROOT, paths.source)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `${JSON.stringify({ ...source, ...excerptRecord(source), generatedAt: new Date().toISOString() }, null, 2)}\n`)
  }
}

/** AI 요약이 규칙에 맞으면 버전 기록에 남기고 그 요약으로 지문을 다시 계산한다. 아니면 기록을 그대로 둔다. */
function excerptRecord(source) {
  const excerptFile = join(ROOT, 'work', id, 'excerpt.txt')
  const contentFile = join(ROOT, 'work', id, 'content.json')
  if (!existsSync(excerptFile)) {
    console.warn(`! excerpt: work/${id}/excerpt.txt가 없어 요약은 기재하지 않습니다.`)
    return {}
  }
  const excerpt = readFileSync(excerptFile, 'utf8').trim()
  const content = existsSync(contentFile) ? JSON.parse(readFileSync(contentFile, 'utf8')) : null
  const excerptProblems = checkExcerpt(excerpt, { title: content?.title || source.title })
  if (excerptProblems.length || !content) {
    console.warn(`! excerpt: 요약은 기재하지 않습니다 — ${excerptProblems.join(' ') || 'content.json이 없습니다.'}`)
    return {}
  }
  return { excerpt, contentHash: contentHash({ title: content.title, excerpt, html: content.html }) }
}

if (!process.argv.includes('--no-git-check')) {
  const status = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: REPO_ROOT, encoding: 'utf8' })
  const changed = status.split('\n').filter(Boolean).map((line) => line.slice(3).replace(/^"|"$/g, ''))
  const extra = unexpectedChanges(changed, [paths.scene, paths.source, paths.large, paths.small])
  if (extra.length) problems.push(`허용하지 않은 파일이 바뀌었습니다: ${extra.join(', ')}`)
}

if (problems.length) {
  console.error(`\n${key} 검사 실패:\n${problems.map((problem) => `- ${problem}`).join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`\n${key} 검사 통과: ${Object.values(paths).join(', ')}`)
}
