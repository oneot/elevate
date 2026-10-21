import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import { mergeThumbnails } from '../merge.mjs'
import { redrawPrProblem } from '../lib/pipeline.mjs'

const REPO = 'oneot/elevate'
const sha = (digit) => String(digit).repeat(40)
const published = (number, key, head) => ({
  key, title: `${key} 제목`, number, url: `https://github.com/${REPO}/pull/${number}`, branch: `thumbnail/${key}`, sha: head,
})

/**
 * GitHub REST 흉내. 검사 run은 polls번 조회되면 끝난다. 시간은 sleep으로만 흐른다.
 * checks[브랜치]는 결과 하나('success'), 시도별 결과 배열(['failure', 'success'], 실패한 job 다시 실행 때 다음 값),
 * 또는 { conclusion, polls }다. staleAfterRerun번은 다시 실행을 요청한 뒤에도 이전 시도의 끝난 결과를 돌려준다.
 * @param {{ prs: object[], checks?: Record<string, string|string[]|{ conclusion: string, polls: number }>,
 *   states?: Record<number, object>, mergeErrors?: Record<number, { status: number, times?: number, message?: string }>,
 *   failDispatch?: string[], dispatchErrors?: Record<string, { status: number, times: number }>,
 *   dispatchReturnsRun?: boolean, oldRuns?: object[], staleAfterRerun?: number }} setup
 */
function fakeGitHub({
  prs, checks = {}, states = {}, mergeErrors = {}, failDispatch = [], dispatchErrors = {}, dispatchReturnsRun = true, oldRuns = [], staleAfterRerun = 0,
}) {
  const clock = { now: Date.parse('2026-10-21T01:00:00Z') }
  const calls = []
  const pulls = Object.fromEntries(prs.map((pr) => [pr.number, { state: 'open', merged: false, head: { sha: pr.sha, ref: pr.branch }, ...states[pr.number] }]))
  const runs = new Map(oldRuns.map((run) => [run.id, { ...run }]))
  let nextRun = 500
  const error = (status, message) => Object.assign(new Error(message), { status })
  const startAttempt = (run) => {
    const spec = run.outcomes[run.run_attempt - 1] ?? run.outcomes.at(-1)
    Object.assign(run, { status: 'queued', conclusion: null, final: typeof spec === 'string' ? spec : spec.conclusion, polls: typeof spec === 'string' ? 2 : spec.polls })
  }

  async function api(method, path, body) {
    calls.push({ method, path, body })
    let match
    if (method === 'POST' && (match = /\/actions\/workflows\/([^/]+)\/dispatches$/.exec(path))) {
      const workflow = match[1]
      if (failDispatch.includes(workflow)) throw error(500, `${workflow} dispatch 실패`)
      if (dispatchErrors[workflow]?.times > 0) {
        dispatchErrors[workflow].times -= 1
        throw error(dispatchErrors[workflow].status, `${workflow} 일시 오류`)
      }
      const id = nextRun++
      const html_url = `https://github.com/${REPO}/actions/runs/${id}`
      if (workflow === 'web-checks.yml') {
        const pr = Object.values(pulls).find((entry) => entry.head.ref === body.ref)
        const spec = checks[body.ref] ?? 'success'
        const run = { id, html_url, head_sha: pr.head.sha, created_at: new Date(clock.now).toISOString(), run_attempt: 1, outcomes: [spec].flat() }
        startAttempt(run)
        runs.set(id, run)
      }
      return dispatchReturnsRun ? { workflow_run_id: id, run_url: `https://api.github.com/repos/${REPO}/actions/runs/${id}`, html_url } : null
    }
    if (method === 'POST' && (match = /\/actions\/runs\/(\d+)\/rerun-failed-jobs$/.exec(path))) {
      const run = runs.get(Number(match[1]))
      if (run.status !== 'completed') throw error(403, 'This workflow is already running')
      run.stale = { ...run, stale: undefined, reads: staleAfterRerun }
      run.run_attempt += 1
      startAttempt(run)
      return null
    }
    if (method === 'GET' && (match = /\/actions\/runs\/(\d+)$/.exec(path))) {
      const run = runs.get(Number(match[1]))
      if (run.stale?.reads > 0) {
        run.stale.reads -= 1
        const { reads, outcomes, final, polls, stale, ...old } = run.stale
        return old
      }
      run.polls -= 1
      if (run.polls <= 0) Object.assign(run, { status: 'completed', conclusion: run.final })
      else run.status = 'in_progress'
      const { outcomes, final, polls, stale, ...visible } = run
      return visible
    }
    if (method === 'GET' && /\/actions\/workflows\/web-checks\.yml\/runs\?/.test(path)) {
      const query = new URLSearchParams(path.split('?')[1])
      return { workflow_runs: [...runs.values()].filter((run) => run.head_sha === query.get('head_sha')).map((run) => ({ ...run })) }
    }
    if (method === 'GET' && (match = /\/pulls\/(\d+)$/.exec(path))) return structuredClone(pulls[match[1]])
    if (method === 'PUT' && (match = /\/pulls\/(\d+)\/merge$/.exec(path))) {
      const number = Number(match[1])
      const refusal = mergeErrors[number]
      if (refusal && (refusal.times ?? Infinity) > 0) {
        refusal.times = (refusal.times ?? Infinity) - 1
        throw error(refusal.status, refusal.message || 'Pull Request is not mergeable')
      }
      if (body.sha !== pulls[number].head.sha) throw error(409, 'Head branch was modified')
      Object.assign(pulls[number], { state: 'closed', merged: true })
      return { sha: `merge-${number}`, merged: true }
    }
    if (method === 'GET' && /\/labels\/[^/]+$/.test(path)) throw error(404, 'Not Found')
    if (method === 'POST' && /\/(labels|comments)$/.test(path)) return {}
    if (method === 'DELETE') return null
    throw new Error(`예상하지 못한 호출: ${method} ${path}`)
  }

  const sleep = async (ms) => { clock.now += ms }
  const find = (method, pattern) => calls.filter((call) => call.method === method && pattern.test(call.path))
  return { api, calls, clock, sleep, now: () => clock.now, find }
}

const run = (gh, prs, options = {}) => mergeThumbnails({
  prs, api: gh.api, repo: REPO, runUrl: 'https://github.com/oneot/elevate/actions/runs/1', sleep: gh.sleep, now: gh.now, log: () => {}, ...options,
})

describe('merging thumbnail PRs without a person', () => {
  it('merges the one redraw PR only with the redraw check, then deploys once', async () => {
    const pr = { key: 'redraw', title: '썸네일 다시 그리기: 70개', number: 31, url: `https://github.com/${REPO}/pull/31`, branch: 'thumbnail-redraw/987654', sha: sha(7) }
    const refused = fakeGitHub({ prs: [pr] })
    const normal = await run(refused, [pr])
    assert.equal(normal.merged.length, 0)
    assert.match(normal.errors.join(), /잘못된 key/)
    assert.equal(refused.calls.length, 0, '기본 검사로는 아무것도 하지 않는다')

    const gh = fakeGitHub({ prs: [pr] })
    const result = await run(gh, [pr], { checkPr: redrawPrProblem })
    assert.deepEqual(result.merged.map((item) => [item.number, item.mergeSha]), [[31, 'merge-31']])
    assert.deepEqual(gh.find('POST', /web-checks\.yml\/dispatches$/).map((call) => call.body.ref), ['thumbnail-redraw/987654'])
    assert.deepEqual(gh.find('DELETE', /\/git\/refs\/heads\//).map((call) => call.path), [`/repos/${REPO}/git/refs/heads/thumbnail-redraw/987654`])
    assert.deepEqual(result.deployed, ['deploy.yml', 'sync-admin-thumbnails.yml'])
  })

  it('merges every PR whose checks pass in order, deletes its branch and then deploys once', async () => {
    const prs = [published(11, 'm365/first', sha(1)), published(12, 'word/second', sha(2))]
    const gh = fakeGitHub({ prs })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => [pr.number, pr.mergeSha]), [[11, 'merge-11'], [12, 'merge-12']])
    assert.deepEqual(result.blocked, [])
    assert.deepEqual(result.errors, [])
    const checks = gh.find('POST', /web-checks\.yml\/dispatches$/)
    assert.deepEqual(checks.map((call) => call.body.ref), ['thumbnail/m365/first', 'thumbnail/word/second'])
    const merges = gh.find('PUT', /\/merge$/)
    assert.deepEqual(merges.map((call) => [call.path, call.body]), [
      [`/repos/${REPO}/pulls/11/merge`, { merge_method: 'merge', sha: sha(1) }],
      [`/repos/${REPO}/pulls/12/merge`, { merge_method: 'merge', sha: sha(2) }],
    ])
    assert.deepEqual(gh.find('DELETE', /\/git\/refs\/heads\//).map((call) => call.path), [
      `/repos/${REPO}/git/refs/heads/thumbnail/m365/first`,
      `/repos/${REPO}/git/refs/heads/thumbnail/word/second`,
    ])
    const deploys = gh.find('POST', /\/(deploy|sync-admin-thumbnails)\.yml\/dispatches$/)
    assert.deepEqual(deploys.map((call) => [call.path.split('/').at(-2), call.body.ref]), [['deploy.yml', 'main'], ['sync-admin-thumbnails.yml', 'main']])
    assert.ok(gh.calls.indexOf(deploys[0]) > gh.calls.indexOf(merges.at(-1)), '배포는 모든 병합 뒤에 실행한다')
    assert.deepEqual(result.deployed, ['deploy.yml', 'sync-admin-thumbnails.yml'])
  })

  it('keeps a PR whose checks failed open with a label and comment, and still deploys the others', async () => {
    const prs = [published(21, 'm365/broken', sha(3)), published(22, 'excel/fine', sha(4))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/m365/broken': 'failure' } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [22])
    assert.deepEqual(result.blocked.map((pr) => pr.number), [21])
    assert.match(result.blocked[0].reason, /Repository checks가 통과하지 않았습니다 \(실패, 2번 실행\)/)
    assert.deepEqual(gh.find('PUT', /\/merge$/).map((call) => call.path), [`/repos/${REPO}/pulls/22/merge`])
    assert.deepEqual(gh.find('POST', /\/repos\/[^/]+\/[^/]+\/labels$/).map((call) => call.body.name), ['thumbnail-merge-blocked'])
    assert.deepEqual(gh.find('POST', /\/issues\/21\/labels$/).map((call) => call.body), [{ labels: ['thumbnail-merge-blocked'] }])
    const comment = gh.find('POST', /\/issues\/21\/comments$/)[0].body.body
    assert.match(comment, /자동으로 병합하지 않았습니다/)
    assert.match(comment, /actions\/runs\/\d+/)
    assert.equal(gh.find('DELETE', /thumbnail\/m365\/broken$/).length, 0, '병합하지 않은 브랜치는 지우지 않는다')
    assert.equal(gh.find('POST', /deploy\.yml\/dispatches$/).length, 1)
  })

  it('does not deploy when nothing was merged', async () => {
    const prs = [published(31, 'teams/a', sha(5))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/teams/a': 'cancelled' } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged, [])
    assert.match(result.blocked[0].reason, /취소됨/)
    assert.equal(gh.find('POST', /rerun-failed-jobs$/).length, 0, '취소된 검사는 다시 실행하지 않는다')
    assert.equal(gh.find('POST', /\/(deploy|sync-admin-thumbnails)\.yml\/dispatches$/).length, 0)
  })

  it('reruns the failed jobs once and merges when the rerun passes', async () => {
    const prs = [published(35, 'm365/flaky-install', sha(1))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/m365/flaky-install': ['failure', 'success'] } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [35])
    assert.deepEqual(gh.find('POST', /rerun-failed-jobs$/).map((call) => call.path), [`/repos/${REPO}/actions/runs/500/rerun-failed-jobs`])
  })

  it('keeps the PR blocked when the checks fail again after the rerun', async () => {
    const prs = [published(36, 'm365/really-broken', sha(2))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/m365/really-broken': ['failure', 'failure'] } })
    const result = await run(gh, prs)

    assert.match(result.blocked[0].reason, /실패, 2번 실행/)
    assert.equal(gh.find('POST', /rerun-failed-jobs$/).length, 1, '한 번만 다시 실행한다')
    assert.equal(gh.find('PUT', /\/merge$/).length, 0)
  })

  it('waits for the rerun to finish instead of reading the old failed attempt again', async () => {
    const prs = [published(37, 'm365/slow-rerun', sha(3))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/m365/slow-rerun': ['failure', 'success'] }, staleAfterRerun: 2 })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [37])
    assert.deepEqual(result.blocked, [])
  })

  it('retries a checks request that hit a temporary server error', async () => {
    const prs = [published(38, 'm365/api-hiccup', sha(4))]
    const gh = fakeGitHub({ prs, dispatchErrors: { 'web-checks.yml': { status: 502, times: 1 } } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [38])
    assert.equal(gh.find('POST', /web-checks\.yml\/dispatches$/).length, 2)
  })

  it('does not merge when the branch changed after publishing', async () => {
    const prs = [published(41, 'onenote/changed', sha(6))]
    const gh = fakeGitHub({ prs, states: { 41: { head: { sha: sha(7), ref: 'thumbnail/onenote/changed' } } } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged, [])
    assert.match(result.blocked[0].reason, /브랜치가 바뀌었습니다/)
    assert.equal(gh.find('PUT', /\/merge$/).length, 0)
  })

  it('skips PRs that were merged or closed in the meantime', async () => {
    const prs = [published(51, 'github/done', sha(8))]
    const gh = fakeGitHub({ prs, states: { 51: { state: 'closed', merged: true } } })
    const result = await run(gh, prs)

    assert.deepEqual(result.skipped.map((pr) => [pr.number, pr.reason]), [[51, '이미 병합된 PR입니다.']])
    assert.equal(gh.find('PUT', /\/merge$/).length, 0)
    assert.equal(gh.find('POST', /\/labels$/).length, 0)
  })

  it('stops waiting for checks after the time limit', async () => {
    const prs = [published(61, 'azure/slow', sha(9))]
    const gh = fakeGitHub({ prs, checks: { 'thumbnail/azure/slow': { conclusion: 'success', polls: Infinity } } })
    const start = gh.now()
    const result = await run(gh, prs, { timeoutMs: 10 * 60_000, pollMs: 15_000 })

    assert.match(result.blocked[0].reason, /시간 초과/)
    assert.ok(gh.now() - start >= 10 * 60_000)
    assert.equal(gh.find('PUT', /\/merge$/).length, 0)
  })

  it('finds the checks run by commit when the dispatch response has no run id', async () => {
    const prs = [published(71, 'copilot/lookup', sha(1))]
    const oldRun = { id: 1, head_sha: sha(1), created_at: '2026-10-21T00:30:00Z', status: 'completed', conclusion: 'failure', final: 'failure', polls: 0, html_url: 'old' }
    const gh = fakeGitHub({ prs, dispatchReturnsRun: false, oldRuns: [oldRun] })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [71], '요청 전에 끝난 실패 run은 쓰지 않는다')
    assert.ok(gh.find('GET', /web-checks\.yml\/runs\?/).length >= 1)
  })

  it('reports a PR that GitHub keeps refusing to merge', async () => {
    const prs = [published(81, 'powerpoint/conflict', sha(2))]
    const gh = fakeGitHub({ prs, mergeErrors: { 81: { status: 405 } } })
    const result = await run(gh, prs)

    assert.match(result.blocked[0].reason, /병합하지 못했습니다/)
    assert.equal(gh.find('PUT', /\/merge$/).length, 4, '405는 몇 번 다시 시도한 뒤 포기한다')
    assert.equal(gh.find('POST', /\/issues\/81\/comments$/).length, 1)
    assert.equal(gh.find('POST', /\/(deploy|sync-admin-thumbnails)\.yml\/dispatches$/).length, 0)
  })

  it('retries a merge while GitHub is still checking the new base, but not a changed commit', async () => {
    const prs = [published(83, 'm365/after-first', sha(5)), published(84, 'm365/changed-head', sha(6))]
    const gh = fakeGitHub({ prs, mergeErrors: { 83: { status: 405, times: 1, message: 'Base branch was modified' }, 84: { status: 409, times: 1 } } })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [83])
    assert.deepEqual(result.blocked.map((pr) => pr.number), [84])
    assert.deepEqual(gh.find('PUT', /\/merge$/).map((call) => call.path.split('/').at(-2)), ['83', '83', '84'])
  })

  it('ignores PR data that does not point at a thumbnail branch', async () => {
    const gh = fakeGitHub({ prs: [] })
    const result = await run(gh, [{ ...published(91, 'm365/x', sha(3)), branch: 'main' }])

    assert.equal(gh.calls.length, 0)
    assert.match(result.errors[0], /thumbnail\/m365\/x/)
  })

  it('reports a deploy that could not be started after a few tries', async () => {
    const prs = [published(95, 'forms/deploy', sha(4))]
    const gh = fakeGitHub({ prs, failDispatch: ['deploy.yml'] })
    const result = await run(gh, prs)

    assert.deepEqual(result.merged.map((pr) => pr.number), [95])
    assert.deepEqual(result.deployed, ['sync-admin-thumbnails.yml'])
    assert.match(result.errors[0], /deploy\.yml 실행 요청 실패/)
    assert.equal(gh.find('POST', /deploy\.yml\/dispatches$/).length, 3, '서버 오류는 세 번까지 시도한다')
  })
})
