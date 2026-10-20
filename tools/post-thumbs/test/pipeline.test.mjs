import { strict as assert } from 'node:assert'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import sharp from 'sharp'
import { contentHash, htmlToOutline, parseKey, thumbPaths, toPublicPost } from '../lib/posts.mjs'
import { checkExcerpt, checkScene, checkWebps, classifyPost, failureTitle, keyFromFailureTitle, mergeDecision, pickChecksRun, pickExcerptExamples, planPosts, publishedPrProblem, unexpectedChanges, webpSize } from '../lib/pipeline.mjs'
import { getActionsIdToken, writeExcerpt } from '../lib/excerpt.mjs'
import { checkExcerptFiles, listAutoScenes, writeWebps } from '../render.mjs'

const post = (key, title = `${key} 제목`) => ({ key, title })

describe('post keys and paths', () => {
  it('accepts <app>/<slug> for the 13 public apps only', () => {
    assert.deepEqual(parseKey('m365/test2'), { key: 'm365/test2', category: 'm365', slug: 'test2', id: 'm365__test2' })
    assert.equal(parseKey(' copilot-studio/ai-agent ').key, 'copilot-studio/ai-agent')
    for (const bad of ['', 'm365', 'event/hackathon-1', 'm365/../x', 'm365/a b', 'M365/test']) {
      assert.throws(() => parseKey(bad), /잘못된 key/, bad)
    }
  })

  it('writes the scene next to the kit and the cards where the public site reads them', () => {
    assert.deepEqual(thumbPaths('word/wordonline1'), {
      scene: 'tools/post-thumbs/scenes/auto/word/wordonline1.js',
      source: 'tools/post-thumbs/sources/word/wordonline1.json',
      large: 'Elevate.Web/src/assets/post-thumbs/word/wordonline1-960.webp',
      small: 'Elevate.Web/src/assets/post-thumbs/word/wordonline1-480.webp',
    })
  })

  it('uses the public site app, title and excerpt of a post', () => {
    const shown = toPublicPost({
      category: 'm365', slug: 'wordonline1', series: 'Word Online 입문 가이드', tags: [],
      title: 'AI Creative Agent Team 제작하기', excerpt: '', publishedAt: '2026-03-09T00:00:00.000Z', updatedAt: '2026-03-24T08:34:20.000Z',
    })
    assert.equal(shown.key, 'word/wordonline1')
    assert.equal(shown.apiCategory, 'm365')
    assert.equal(shown.title, 'AI Creative Agent Team 만들기')
    assert.equal(shown.serverTitle, 'AI Creative Agent Team 제작하기')
    assert.equal(shown.date, '2026-03-09')
    assert.equal(shown.updatedAt, '2026-03-24T08:34:20.000Z')
    assert.equal(shown.id, null)
    assert.equal(toPublicPost({ id: 'post-7', category: 'teams', slug: 'teams-class', tags: [], title: 't', excerpt: '' }).id, 'post-7')
  })
})

describe('post body outline for the AI', () => {
  it('keeps headings, lists, tables, images and the start of code blocks', () => {
    const html = [
      '<h2>실습 목표</h2><p>Copilot Studio에서 <strong>팀장 에이전트</strong>를 만듭니다.&nbsp;&lt;중요&gt;</p>',
      '<ul><li><p>발표자료 — presentation.pptx</p><ul><li><p>10장 내외 슬라이드</p></li></ul></li><li>포스터</li></ul>',
      '<table><tr><th>이름</th><th>역할</th></tr><tr><td>A</td><td>기획</td></tr></table>',
      '<p><img src="https://x.blob.core.windows.net/a.png?sig=1" alt="에이전트 흐름도"><img src="b.png"></p>',
      `<pre><code>${Array.from({ length: 15 }, (_, i) => `line ${i + 1}`).join('\n')}</code></pre>`,
      '<blockquote><p>TIP. 미리 저장하세요</p></blockquote><h3>마무리 &amp; 정리</h3>',
    ].join('')
    const text = htmlToOutline(html)
    assert.match(text, /^## 실습 목표$/m)
    assert.match(text, /Copilot Studio에서 팀장 에이전트를 만듭니다\. <중요>/)
    assert.match(text, /^- 발표자료 — presentation\.pptx\n  - 10장 내외 슬라이드\n- 포스터$/m)
    assert.match(text, /\| 이름 \| 역할 \|/)
    assert.match(text, /\[이미지: 에이전트 흐름도\]/)
    assert.match(text, /^\[이미지\]$/m)
    assert.match(text, /line 12\n… \(코드 3줄 더 있음\)/)
    assert.doesNotMatch(text, /line 13/)
    assert.match(text, /^> TIP\. 미리 저장하세요$/m)
    assert.match(text, /^### 마무리 & 정리$/m)
    assert.doesNotMatch(text, /sig=1/)
    assert.doesNotMatch(text, /<\/?(p|li|h\d|strong|img|code|pre|table|tr|td|th|blockquote)\b/)
    assert.doesNotMatch(text, /\n{3,}/)
  })

  it('shortens very long posts', () => {
    const text = htmlToOutline(`<p>${'가'.repeat(30)}</p>`, { maxLength: 10 })
    assert.match(text, /^가{10}\n\n… \(본문이 길어 20자를 생략함\)$/)
  })
})

describe('content fingerprint', () => {
  const base = { title: '웹 버전 시작하기', excerpt: '설치 없이 Word를 엽니다.', html: '<h2>시작</h2><p>office.com에 로그인합니다.</p><img src="a.png?sig=1" alt="로그인">' }

  it('ignores signed image URLs and whitespace but not text, images or the shown title', () => {
    const hash = contentHash(base)
    assert.match(hash, /^sha256:[0-9a-f]{64}$/)
    assert.equal(contentHash({ ...base, html: base.html.replace('sig=1', 'sig=2').replace('<p>', '<p>  ') }), hash)
    assert.notEqual(contentHash({ ...base, html: base.html.replace('로그인합니다', '접속합니다') }), hash)
    assert.notEqual(contentHash({ ...base, html: base.html.replace('alt="로그인"', 'alt="첫 화면"') }), hash)
    assert.notEqual(contentHash({ ...base, title: '웹 버전 처음 쓰기' }), hash)
    assert.notEqual(contentHash({ ...base, excerpt: '' }), hash)
  })

  it('reads the whole body, including long code blocks', () => {
    const code = (last) => `<pre><code>${Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')}\n${last}</code></pre>`
    assert.notEqual(contentHash({ ...base, html: code('end A') }), contentHash({ ...base, html: code('end B') }))
  })
})

describe('choosing posts to illustrate', () => {
  const H1 = 'sha256:1'
  const H2 = 'sha256:2'
  const none = { exists: false, contentHash: null }
  const state = (extra) => ({ hasThumb: true, source: { contentHash: H1, postUpdatedAt: 't1' }, branch: none, failed: false, updatedAt: 't1', ...extra })

  it('makes a thumbnail for a new post unless its PR branch was made from the same content', () => {
    assert.deepEqual(classifyPost(state({ hasThumb: false, source: null })), { reason: 'new' })
    const pending = state({ hasThumb: false, source: null, branch: { exists: true, contentHash: H1 } })
    assert.deepEqual(classifyPost(pending), { need: 'hash' })
    assert.equal(classifyPost({ ...pending, currentHash: H1 }), null)
    assert.deepEqual(classifyPost({ ...pending, currentHash: H2 }), { reason: 'new' })
    assert.equal(classifyPost({ ...pending, branch: { exists: true, contentHash: null }, currentHash: H2 }), null)
  })

  it('makes a new version only when the shown title, excerpt or body changed', () => {
    assert.equal(classifyPost(state()), null)
    assert.deepEqual(classifyPost(state({ updatedAt: 't2' })), { need: 'hash' })
    assert.equal(classifyPost(state({ updatedAt: 't2', currentHash: H1 })), null)
    assert.deepEqual(classifyPost(state({ updatedAt: 't2', currentHash: H2 })), { reason: 'edited' })
    assert.equal(classifyPost(state({ updatedAt: 't2', currentHash: H2, branch: { exists: true, contentHash: H2 } })), null)
    assert.deepEqual(classifyPost(state({ updatedAt: 't2', currentHash: H2, branch: { exists: true, contentHash: H1 } })), { reason: 'edited' })
  })

  it('leaves images without a version record and posts with an open failure issue alone', () => {
    assert.equal(classifyPost(state({ source: null, updatedAt: 't2', currentHash: H2 })), null)
    assert.equal(classifyPost(state({ hasThumb: false, source: null, failed: true })), null)
  })

  it('puts new posts first, then edited ones, newest first, up to the limit', async () => {
    const posts = ['m365/edited-new', 'm365/new-a', 'word/same', 'm365/edited-old', 'azure/new-b'].map((key) => post(key))
    const states = {
      'm365/edited-new': state({ updatedAt: 't2' }),
      'm365/new-a': state({ hasThumb: false, source: null }),
      'word/same': state({ updatedAt: 't2' }),
      'm365/edited-old': state({ updatedAt: 't3' }),
      'azure/new-b': state({ hasThumb: false, source: null }),
    }
    const hashed = []
    const hashOf = async (item) => { hashed.push(item.key); return item.key === 'word/same' ? H1 : H2 }
    const items = await planPosts({ posts, stateOf: (item) => states[item.key], hashOf, max: 3 })
    assert.deepEqual(items.map((item) => `${item.key}:${item.reason}`), ['m365/new-a:new', 'azure/new-b:new', 'm365/edited-new:edited'])
    assert.deepEqual(items[0], { key: 'm365/new-a', id: 'm365__new-a', category: 'm365', slug: 'new-a', title: 'm365/new-a 제목', reason: 'new' })
    assert.deepEqual(hashed, ['m365/edited-new', 'word/same', 'm365/edited-old'])
    assert.deepEqual(await planPosts({ posts, stateOf: (item) => states[item.key], hashOf, max: 0 }), [])
  })

  it('remakes a requested post even when nothing changed', async () => {
    const posts = [post('word/wordonline1')]
    const items = await planPosts({ posts, stateOf: () => state(), hashOf: async () => H1, force: 'word/wordonline1' })
    assert.deepEqual(items.map((item) => `${item.key}:${item.reason}`), ['word/wordonline1:manual'])
    await assert.rejects(planPosts({ posts, stateOf: () => state(), hashOf: async () => H1, force: 'm365/not-published' }), /게시된 글이 아닙니다/)
  })

  it('reads the post back from a failure issue title', () => {
    assert.equal(keyFromFailureTitle(failureTitle('m365/test')), 'm365/test')
    assert.equal(keyFromFailureTitle('다른 이슈'), null)
  })
})

describe('checking what the AI produced', () => {
  const scene = (body) => `(() => {\n  scene('m365/test', (K, c) => ${body}, { css: '.x { color: rgb(var(--tint)); }' });\n})();\n`

  it('accepts one offline scene registered with the right key', () => {
    assert.deepEqual(checkScene(scene("K.win({ x: 9, y: 8, w: 82, h: 52, title: '설정', body: '<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>' })"), 'm365/test'), [])
  })

  it('rejects a wrong key, a second scene and code that reaches the network', () => {
    assert.match(checkScene(scene('K.card({})'), 'm365/other').join(), /'m365\/test'입니다/)
    assert.match(checkScene(`${scene('K.card({})')}\nscene('m365/x', () => '')`, 'm365/test').join(), /한 번 등록/)
    assert.match(checkScene(scene("fetch('/api')"), 'm365/test').join(), /fetch/)
    assert.match(checkScene(scene("'<img src=\"https://example.com/a.png\">'"), 'm365/test').join(), /외부 URL/)
    assert.match(checkScene(scene("import('./x.js')"), 'm365/test').join(), /동적 import/)
  })

  it('accepts only the card WebP sizes the public site uses', async () => {
    const make = (width, height) => sharp({ create: { width, height, channels: 3, background: '#88aaff' } }).webp({ quality: 82 }).toBuffer()
    const [large, small, wrong] = await Promise.all([make(960, 540), make(480, 270), make(800, 450)])
    assert.deepEqual(webpSize(large), { width: 960, height: 540 })
    assert.deepEqual(checkWebps({ large, small }), [])
    assert.match(checkWebps({ large: wrong, small }).join(), /800×450/)
    assert.match(checkWebps({ large: Buffer.from('not an image'), small }).join(), /WebP가 아닙니다/)
  })

  it('flags any changed file besides the scene and the two images', () => {
    const allowed = Object.values(thumbPaths('m365/test'))
    assert.deepEqual(unexpectedChanges(allowed, allowed), [])
    assert.deepEqual(unexpectedChanges([...allowed, 'tools/post-thumbs/kit.js'], allowed), ['tools/post-thumbs/kit.js'])
  })
})

describe('deciding whether to merge a thumbnail PR', () => {
  const SHA = 'a'.repeat(40)
  const open = (sha = SHA) => ({ state: 'open', merged: false, head: { sha } })

  it('merges an open PR at the published commit whose checks passed on that commit', () => {
    assert.deepEqual(mergeDecision({ pr: open(), expectedSha: SHA, checks: { conclusion: 'success', sha: SHA } }), { action: 'merge', reason: 'Repository checks 통과' })
  })

  it('leaves failed, cancelled, timed-out or missing checks for a person', () => {
    for (const [checks, text] of [[{ conclusion: 'failure' }, '실패'], [{ conclusion: 'cancelled' }, '취소됨'], [{ conclusion: 'timed_out' }, '시간 초과'], [{ conclusion: 'not_started' }, '실행 요청 실패'], [null, '없음'], [{ conclusion: 'failure', attempts: 2 }, '실패, 2번 실행']]) {
      const decision = mergeDecision({ pr: open(), expectedSha: SHA, checks })
      assert.equal(decision.action, 'block')
      assert.match(decision.reason, new RegExp(text))
    }
  })

  it('does not merge a branch that changed after publishing or checks of another commit', () => {
    assert.match(mergeDecision({ pr: open('b'.repeat(40)), expectedSha: SHA, checks: { conclusion: 'success' } }).reason, /브랜치가 바뀌었습니다/)
    assert.match(mergeDecision({ pr: open(), expectedSha: SHA, checks: { conclusion: 'success', sha: 'c'.repeat(40) } }).reason, /검사한 커밋/)
  })

  it('skips PRs that are already merged or closed', () => {
    assert.deepEqual(mergeDecision({ pr: { state: 'closed', merged: true, head: { sha: SHA } }, expectedSha: SHA, checks: { conclusion: 'success' } }), { action: 'skip', reason: '이미 병합된 PR입니다.' })
    assert.equal(mergeDecision({ pr: { state: 'closed', merged: false, head: { sha: SHA } }, expectedSha: SHA, checks: null }).action, 'skip')
  })

  it('picks the newest checks run started for the commit after the request', () => {
    const since = Date.parse('2026-10-21T00:10:00Z')
    const run = (id, sha, at) => ({ id, head_sha: sha, created_at: at })
    const runs = [
      run(1, SHA, '2026-10-21T00:00:00Z'), // 요청 전의 오래된 run
      run(2, SHA, '2026-10-21T00:10:05Z'),
      run(3, 'b'.repeat(40), '2026-10-21T00:10:06Z'), // 다른 커밋
      run(4, SHA, '2026-10-21T00:09:30Z'), // 시계 차이 안
    ]
    assert.equal(pickChecksRun(runs, { sha: SHA, since }).id, 2)
    assert.equal(pickChecksRun(runs.slice(0, 1), { sha: SHA, since }), null)
    assert.equal(pickChecksRun(undefined, { sha: SHA, since }), null)
  })

  it('accepts only PRs from this pipeline before touching their branches', () => {
    const pr = { key: 'm365/new-post', number: 12, branch: 'thumbnail/m365/new-post', sha: SHA }
    assert.equal(publishedPrProblem(pr), null)
    assert.match(publishedPrProblem({ ...pr, branch: 'main' }), /thumbnail\/m365\/new-post/)
    assert.match(publishedPrProblem({ ...pr, number: '12' }), /PR 번호/)
    assert.match(publishedPrProblem({ ...pr, sha: 'abc' }), /SHA/)
    assert.match(publishedPrProblem({ ...pr, key: 'm365/../x' }), /잘못된 key/)
  })
})

describe('the AI summary line', () => {
  const GOOD = '반복되는 학생 질문에 대신 답해 주는 학급 도우미 에이전트를 만들고 공유합니다.'

  it('accepts one plain sentence in the tone of the tidied public summaries', () => {
    assert.deepEqual(checkExcerpt(GOOD, { title: '학급 도우미 에이전트 만들기' }), [])
    assert.deepEqual(checkExcerpt(`  ${GOOD}\n`), [])
  })

  it('rejects empty, multi-line, too short or long, unfinished, decorated or repeated-title summaries', () => {
    const cases = [
      ['', /비어/],
      [`${GOOD}\n둘째 줄입니다.`, /한 줄/],
      ['짧게 씁니다.', /25~70자/],
      [`${'아주 긴 설명을 이어 붙여 '.repeat(5)}만듭니다.`, /25~70자/],
      ['학급 도우미 에이전트를 만들고 반 학생들과 함께 공유해요', /'~니다\.'로 끝나야/],
      ['에이전트를 만듭니다. 그리고 학생들과 함께 공유하는 방법도 익힙니다.', /한 문장/],
      ['**학급 도우미** 에이전트를 만들고 반 학생들과 함께 공유합니다.', /마크다운/],
      ['"학급 도우미 에이전트를 만들고 반 학생들과 함께 공유합니다."', /따옴표|'~니다\.'로 끝나야/],
    ]
    for (const [text, problem] of cases) assert.match(checkExcerpt(text).join(' '), problem, text)
    const title = '학급 도우미 에이전트를 만들고 반 학생들과 함께 공유합니다.'
    assert.match(checkExcerpt(title, { title }).join(' '), /제목과 같습니다/)
  })

  it('shows the AI tidied summaries from the same app first, then from other apps', () => {
    const posts = [
      { key: 'teams/a', category: 'teams', title: 'A', excerpt: '팀에서 바로 전자필기장을 만들어 학생 노트를 한곳에서 보고 자료를 나눠 줍니다.' },
      { key: 'teams/raw', category: 'teams', title: 'Raw', excerpt: '1. 팀즈 과제 및 성적' },
      { key: 'word/b', category: 'word', title: 'B', excerpt: '스타일로 상담일지를 정리하고, 받아쓰기와 단축키로 작업 속도를 높입니다.' },
      { key: 'teams/self', category: 'teams', title: 'Self', excerpt: GOOD },
    ]
    assert.deepEqual(pickExcerptExamples(posts, { key: 'teams/self', category: 'teams' }).map((example) => example.title), ['A', 'B'])
    assert.equal(pickExcerptExamples(posts, { key: 'teams/self', category: 'teams', limit: 1 }).length, 1)
  })

  it('lets the AI check its summary file with the renderer', () => {
    const root = mkdtempSync(join(tmpdir(), 'excerpt-'))
    const logs = []
    const log = console.log
    console.log = (line) => logs.push(line)
    try {
      mkdirSync(join(root, 'work/teams__class'), { recursive: true })
      writeFileSync(join(root, 'work/teams__class/content.json'), JSON.stringify({ title: '학급 도우미', html: '' }))
      writeFileSync(join(root, 'work/teams__class/excerpt.txt'), `${GOOD}\n`)
      assert.equal(checkExcerptFiles(['teams/class'], root), 0)
      writeFileSync(join(root, 'work/teams__class/excerpt.txt'), '짧아요')
      assert.equal(checkExcerptFiles(['teams/class'], root), 1)
      assert.equal(checkExcerptFiles(['teams/missing'], root), 1)
    } finally {
      console.log = log
      rmSync(root, { recursive: true, force: true })
    }
    assert.match(logs.join('\n'), /요약 검사 통과/)
    assert.match(logs.join('\n'), /! excerpt: .*25~70자/)
    assert.match(logs.join('\n'), /excerpt\.txt가 없습니다/)
  })
})

describe('writing the AI summary into the post', () => {
  const source = {
    key: 'word/class-guide', id: 'post-9', title: '공동 작업 가이드', postUpdatedAt: '2026-10-21T01:00:00.000Z',
    excerpt: '링크 하나로 반 학생들과 같은 문서를 열어 함께 고치고 의견을 남깁니다.',
  }
  const reply = (status, body = '') => ({ ok: status >= 200 && status < 300, status, text: async () => body })
  function fakeFetch(...statuses) {
    const calls = []
    return {
      calls,
      fetchImpl: async (url, init) => {
        calls.push({ url, init })
        const status = statuses[Math.min(calls.length, statuses.length) - 1]
        if (status instanceof Error) throw status
        return reply(status, `{"message":"status ${status}"}`)
      },
    }
  }
  const write = (fetchImpl, options = {}) => writeExcerpt({
    source, baseUrl: 'https://api.example.test/api/automation', getToken: async () => 'oidc-token', fetchImpl, sleep: async () => {}, ...options,
  })

  it('sends the summary with the GitHub token, the slug and the version the AI read', async () => {
    const { calls, fetchImpl } = fakeFetch(200)
    assert.deepEqual(await write(fetchImpl), { status: 'written', note: '게시글에 기재함' })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, 'https://api.example.test/api/automation/posts/post-9/excerpt')
    assert.equal(calls[0].init.method, 'PUT')
    assert.equal(calls[0].init.headers.authorization, 'Bearer oidc-token')
    assert.deepEqual(JSON.parse(calls[0].init.body), { excerpt: source.excerpt, slug: 'class-guide', expectedUpdatedAt: source.postUpdatedAt })
  })

  it('skips without failing when the post changed, is gone or there is no valid summary', async () => {
    assert.equal((await write(fakeFetch(409).fetchImpl)).status, 'skipped')
    assert.match((await write(fakeFetch(409).fetchImpl)).note, /바뀌어/)
    assert.equal((await write(fakeFetch(404).fetchImpl)).status, 'skipped')
    const none = fakeFetch(200)
    assert.equal((await writeExcerpt({ source: { ...source, excerpt: null }, baseUrl: 'x', fetchImpl: none.fetchImpl })).status, 'skipped')
    assert.equal((await writeExcerpt({ source: { ...source, excerpt: '짧아요' }, baseUrl: 'x', fetchImpl: none.fetchImpl })).status, 'skipped')
    assert.equal((await writeExcerpt({ source: { ...source, id: null }, baseUrl: 'x', fetchImpl: none.fetchImpl })).status, 'skipped')
    assert.equal(none.calls.length, 0, '쓸 것이 없으면 서버를 부르지 않는다')
  })

  it('retries server and network errors, then reports refusals as failures', async () => {
    const flaky = fakeFetch(502, new Error('ECONNRESET'), 200)
    assert.equal((await write(flaky.fetchImpl)).status, 'written')
    assert.equal(flaky.calls.length, 3)

    const down = fakeFetch(503)
    const result = await write(down.fetchImpl)
    assert.equal(result.status, 'failed')
    assert.equal(down.calls.length, 3)

    const refused = fakeFetch(403)
    assert.match((await write(refused.fetchImpl)).note, /HTTP 403/)
    assert.equal(refused.calls.length, 1, '권한 거절은 다시 시도하지 않는다')

    assert.match((await write(fakeFetch(200).fetchImpl, { getToken: async () => { throw new Error('id-token 권한 없음') } })).note, /id-token/)
  })

  it('asks GitHub for a token for the server audience inside Actions only', async () => {
    const calls = []
    const fetchImpl = async (url, init) => {
      calls.push({ url, init })
      return { ok: true, status: 200, json: async () => ({ value: 'jwt' }) }
    }
    const env = { ACTIONS_ID_TOKEN_REQUEST_URL: 'https://token.example.test/oidc?api-version=2', ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'request-token' }
    assert.equal(await getActionsIdToken('api://elevate-post-automation', { env, fetchImpl }), 'jwt')
    assert.equal(calls[0].url, 'https://token.example.test/oidc?api-version=2&audience=api%3A%2F%2Felevate-post-automation')
    assert.equal(calls[0].init.headers.authorization, 'bearer request-token')
    await assert.rejects(getActionsIdToken('x', { env: {}, fetchImpl }), /id-token: write/)
  })
})

describe('renderer helpers', () => {
  it('lists AI scenes for render.html in a stable order', () => {
    const root = mkdtempSync(join(tmpdir(), 'thumbs-'))
    try {
      for (const file of ['scenes/auto/word/b.js', 'scenes/auto/word/a.js', 'scenes/auto/azure/z.js', 'scenes/auto/azure/notes.md']) {
        mkdirSync(join(root, file, '..'), { recursive: true })
        writeFileSync(join(root, file), '')
      }
      assert.deepEqual(listAutoScenes(root), ['scenes/auto/azure/z.js', 'scenes/auto/word/a.js', 'scenes/auto/word/b.js'])
      assert.deepEqual(listAutoScenes(join(root, 'missing')), [])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('saves a 960×540 capture as the 960px and 480px card WebPs', async () => {
    const out = mkdtempSync(join(tmpdir(), 'thumbs-out-'))
    try {
      const png = await sharp({ create: { width: 960, height: 540, channels: 4, background: '#ffffff' } }).png().toBuffer()
      const files = await writeWebps(png, out, 'm365', 'test')
      assert.deepEqual(files.map((file) => file.slice(out.length)), ['/m365/test-960.webp', '/m365/test-480.webp'])
      assert.deepEqual(checkWebps({ large: readFileSync(files[0]), small: readFileSync(files[1]) }), [])
    } finally {
      rmSync(out, { recursive: true, force: true })
    }
  })
})
