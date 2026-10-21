import { strict as assert } from 'node:assert'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import sharp from 'sharp'
import { REPO_ROOT, thumbPaths } from '../lib/posts.mjs'
import { publishedPrProblem, redrawPrBody, redrawPrProblem, redrawTargets } from '../lib/pipeline.mjs'
import { readArtifact, readResult } from '../redraw.mjs'
import { autoSceneProblems } from '../render.mjs'

const post = (key, title = `${key} 제목`) => ({ key, title })
const SHA = 'a'.repeat(40)

describe('choosing thumbnails to redraw', () => {
  const posts = [post('word/new-ai'), post('teams/by-hand'), post('excel/no-thumb'), post('m365/by-hand-2'), post('copilot/by-hand-3')]
  const thumbs = new Set(['word/new-ai', 'teams/by-hand', 'm365/by-hand-2', 'copilot/by-hand-3'])
  const aiScenes = new Set(['word/new-ai'])
  const state = { hasThumb: (key) => thumbs.has(key), hasAiScene: (key) => aiScenes.has(key) }

  it('picks every thumbnail drawn by hand (no AI scene yet) in public order, up to the limit', () => {
    const items = redrawTargets({ posts, ...state })
    assert.deepEqual(items.map((item) => item.key), ['teams/by-hand', 'm365/by-hand-2', 'copilot/by-hand-3'])
    assert.deepEqual(items[0], { key: 'teams/by-hand', id: 'teams__by-hand', category: 'teams', slug: 'by-hand', title: 'teams/by-hand 제목', reason: 'redraw' })
    assert.deepEqual(redrawTargets({ posts, ...state, limit: 2 }).map((item) => item.key), ['teams/by-hand', 'm365/by-hand-2'])
  })

  it('redraws the listed posts, including AI ones, once each', () => {
    const items = redrawTargets({ posts, ...state, keys: ' copilot/by-hand-3, word/new-ai,word/new-ai ' })
    assert.deepEqual(items.map((item) => item.key), ['word/new-ai', 'copilot/by-hand-3'])
  })

  it('refuses posts that are not published, have no thumbnail yet or a bad limit', () => {
    assert.throws(() => redrawTargets({ posts, ...state, keys: 'teams/gone' }), /게시된 글이 아닙니다: teams\/gone/)
    assert.throws(() => redrawTargets({ posts, ...state, keys: 'excel/no-thumb' }), /썸네일이 없는 글/)
    assert.throws(() => redrawTargets({ posts, ...state, keys: 'nope/x' }), /잘못된 key/)
    assert.throws(() => redrawTargets({ posts, ...state, limit: 0 }), /limit/)
    assert.throws(() => redrawTargets({ posts, ...state, limit: Number('abc') }), /limit/)
  })
})

describe('the one redraw pull request', () => {
  const pr = { key: 'redraw', title: '썸네일 다시 그리기: 3개', number: 7, url: 'https://github.com/oneot/elevate/pull/7', branch: 'thumbnail-redraw/123456', sha: SHA }

  it('is accepted only by the redraw check, and the normal check still refuses it', () => {
    assert.equal(redrawPrProblem(pr), null)
    assert.match(publishedPrProblem(pr), /잘못된 key/)
    assert.match(redrawPrProblem({ ...pr, branch: 'thumbnail/teams/by-hand' }), /thumbnail-redraw/)
    assert.match(redrawPrProblem({ ...pr, branch: 'thumbnail-redraw/main' }), /thumbnail-redraw/)
    assert.match(redrawPrProblem({ ...pr, key: 'teams/by-hand' }), /key/)
    assert.match(redrawPrProblem({ ...pr, sha: 'abc' }), /SHA/)
    assert.match(redrawPrProblem({ ...pr, number: 0 }), /PR 번호/)
  })

  it('lists what was redrawn with before and after images and what kept its image', () => {
    const body = redrawPrBody({
      done: [{ key: 'teams/by-hand', title: '팀 | 만들기', attempts: 1 }, { key: 'm365/by-hand-2', title: '계정', attempts: 2 }],
      failed: [{ key: 'copilot/by-hand-3', title: '시작하기', reason: '검사 실패: 글자 잘림' }],
      repo: 'oneot/elevate', baseSha: 'b'.repeat(40), headSha: 'c'.repeat(40), runUrl: 'https://run', paths: thumbPaths,
    })
    assert.match(body, /다시 그린 글 \| 2개 \(그중 1개는 두 번째 시도\)/)
    assert.match(body, /지금 이미지를 둔 글 \| 1개/)
    assert.match(body, /`copilot\/by-hand-3` 시작하기 — 검사 실패: 글자 잘림/)
    assert.match(body, /게시글에 기재하지 않고 버전 기록에도 넣지 않았습니다/)
    assert.ok(body.includes(`https://raw.githubusercontent.com/oneot/elevate/${'b'.repeat(40)}/Elevate.Web/src/assets/post-thumbs/teams/by-hand-480.webp`))
    assert.ok(body.includes(`https://raw.githubusercontent.com/oneot/elevate/${'c'.repeat(40)}/Elevate.Web/src/assets/post-thumbs/teams/by-hand-480.webp`))
    assert.match(body, /팀 \\\| 만들기/)
    assert.match(body, /`m365\/by-hand-2` \(두 번째 시도\)/)
  })
})

describe('reading the generate results', () => {
  const item = { key: 'teams/by-hand', id: 'teams__by-hand' }
  const scene = "(() => {\n  scene('teams/by-hand', (K) => K.tile({ x: 2, y: 3 }) + K.pill({ right: 4, bottom: 4, text: '팀' }), {});\n})();\n"
  const source = { key: 'teams/by-hand', id: 'p1', title: '팀', postUpdatedAt: 't1', contentHash: `sha256:${'d'.repeat(64)}`, origin: 'ai', generatedAt: '2026-10-21T00:00:00Z' }

  async function artifact(record = source) {
    const root = mkdtempSync(join(tmpdir(), 'redraw-'))
    const dir = join(root, `thumb-${item.id}`)
    const paths = thumbPaths(item.key)
    const write = (path, data) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), data) }
    const webp = (width, height) => sharp({ create: { width, height, channels: 3, background: '#7c84ff' } }).webp({ quality: 82 }).toBuffer()
    write(paths.scene, scene)
    write(paths.source, JSON.stringify(record))
    write(paths.large, await webp(960, 540))
    write(paths.small, await webp(480, 270))
    return root
  }

  it('takes a checked artifact and its result, and nothing when the post failed', async () => {
    const root = await artifact()
    try {
      const found = readArtifact(root, item)
      assert.equal(found.files.scene, join(root, `thumb-${item.id}`, thumbPaths(item.key).scene))
      assert.equal(readArtifact(root, { key: 'm365/by-hand-2', id: 'm365__by-hand-2' }), null)
      writeFileSync(join(root, `result-${item.id}.json`), JSON.stringify({ key: item.key, ok: false, attempts: 2, problems: ['글자 잘림'] }))
      assert.deepEqual(readResult(root, item), { key: item.key, ok: false, attempts: 2, problems: ['글자 잘림'] })
      assert.equal(readResult(root, { id: 'm365__none' }), null)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('refuses a version record that validate did not rewrite (the same as on main)', async () => {
    const existing = { key: 'm365/signup', id: 'm365__signup' }
    const onMain = readFileSync(join(REPO_ROOT, thumbPaths(existing.key).source), 'utf8')
    const root = mkdtempSync(join(tmpdir(), 'redraw-'))
    try {
      const dir = join(root, `thumb-${existing.id}`)
      const paths = thumbPaths(existing.key)
      const write = (path, data) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), data) }
      const webp = (width, height) => sharp({ create: { width, height, channels: 3, background: '#38c8ff' } }).webp({ quality: 82 }).toBuffer()
      write(paths.scene, scene.replace('teams/by-hand', existing.key))
      write(paths.source, onMain)
      write(paths.large, await webp(960, 540))
      write(paths.small, await webp(480, 270))
      assert.throws(() => readArtifact(root, existing), /새로 쓰이지 않았습니다/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('refuses a version record that carries an AI excerpt, so a later save does not redraw the post', async () => {
    const root = await artifact({ ...source, excerpt: 'AI가 쓴 요약입니다.' })
    try {
      assert.throws(() => readArtifact(root, item), /AI 요약/)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('checking AI scene code while rendering', () => {
  it('reports the validate rules (like an https:// address in the screen text) for AI scenes only', () => {
    const root = mkdtempSync(join(tmpdir(), 'render-'))
    try {
      mkdirSync(join(root, 'scenes/auto/azure'), { recursive: true })
      const scene = (body) => `(() => {\n  scene('azure/x', (K) => ${body}, {});\n})();\n`
      writeFileSync(join(root, 'scenes/auto/azure/x.js'), scene("'<span>https://oneot.github.io</span>'"))
      assert.deepEqual(autoSceneProblems(['azure/x', 'azure/none'], root), ['azure/x: 허용하지 않는 코드: 외부 URL'])
      writeFileSync(join(root, 'scenes/auto/azure/x.js'), scene("'<span>oneot.github.io</span>'"))
      assert.deepEqual(autoSceneProblems(['azure/x'], root), [])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
