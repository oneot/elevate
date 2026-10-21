#!/usr/bin/env node
/**
 * publish가 열거나 갱신한 썸네일 PR을 사람 없이 병합한다 (GitHub Actions 'Post thumbnails'의 merge 단계).
 *   1. PR 브랜치마다 'Repository checks'(web-checks.yml)를 실행하고 끝나기를 기다린다.
 *      GITHUB_TOKEN으로 만든 PR에는 pull_request 검사가 돌지 않으므로 workflow_dispatch로 실행한다(결과는 PR 커밋에 표시된다).
 *      검사가 실패하면 실패한 job만 한 번 다시 실행한다(npm 설치 중 네트워크 끊김 같은 일시 오류 대비).
 *   2. 검사가 통과하고 PR이 publish가 올린 커밋 그대로면 main에 병합하고(merge commit) 브랜치를 지운다.
 *      검사 실패·시간 초과, 브랜치 변경, 충돌이면 병합하지 않고 라벨(thumbnail-merge-blocked)과 댓글을 남긴다.
 *   3. 하나라도 병합했으면 공개 사이트 배포(deploy.yml)와 관리자 썸네일 동기화(sync-admin-thumbnails.yml)를 한 번씩 실행한다.
 *      GITHUB_TOKEN으로 병합한 커밋은 push 이벤트로 다른 workflow를 깨우지 않는다(workflow_dispatch는 예외).
 *   GitHub API의 일시 오류(5xx·네트워크)는 10초 간격으로 다시 시도한다.
 * 환경 변수:
 *   PRS                     publish 출력 (JSON 배열: { key, title, number, url, branch, sha })
 *   RUN_URL                 이 실행의 주소
 *   CHECKS_TIMEOUT_MINUTES  검사를 기다리는 최대 시간 (기본 30)
 *   GITHUB_TOKEN, GITHUB_REPOSITORY
 *   DRY_RUN=1               아무것도 바꾸지 않고 할 일만 출력한다 (로컬 점검용)
 */
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import {
  CHECKS_WORKFLOW, DEPLOY_WORKFLOWS, MERGE_BLOCKED_LABEL, mergeDecision, pickChecksRun, publishedPrProblem,
} from './lib/pipeline.mjs'
import { ensureLabel, github, repository } from './lib/github.mjs'

const MINUTE = 60_000
const MERGE_ATTEMPTS = 4
const RETRY_MS = 10_000
/** 검사가 실패하면 실패한 job만 이만큼 다시 실행한다 (npm 설치 중 네트워크 끊김 같은 일시 오류 대비). */
const CHECK_RERUNS = 1

/** HTTP 응답이 없거나(네트워크) 5xx면 잠시 뒤 다시 시도할 만하다. */
const isTransient = (error) => error.status === undefined || error.status >= 500

/**
 * @param {{
 *   prs: Array<{ key: string, title: string, number: number, url: string, branch: string, sha: string }>,
 *   api: (method: string, path: string, body?: object) => Promise<any>,  lib/github.mjs의 github()와 같은 형태
 *   repo: string,
 *   runUrl?: string, timeoutMs?: number, pollMs?: number,
 *   sleep?: (ms: number) => Promise<void>, now?: () => number, log?: (line: string) => void,
 *   checkPr?: (pr: object) => string|null,  PR 정보 검사 (기본: publish가 연 thumbnail/<key> PR. 한꺼번에 다시 그리기는 redrawPrProblem)
 * }} options
 * @returns {Promise<{ merged: object[], blocked: object[], skipped: object[], deployed: string[], errors: string[] }>}
 */
export async function mergeThumbnails({
  prs, api, repo, runUrl = '', timeoutMs = 30 * MINUTE, pollMs = 15_000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), now = () => Date.now(), log = console.log,
  checkPr = publishedPrProblem,
}) {
  const result = { merged: [], blocked: [], skipped: [], deployed: [], errors: [] }
  const valid = []
  for (const pr of prs || []) {
    const problem = checkPr(pr)
    if (problem) result.errors.push(`${pr?.key || '(key 없음)'} #${pr?.number ?? '?'}: ${problem}`)
    else valid.push(pr)
  }
  if (!valid.length) return result

  const runLine = runUrl ? `\n- 실행: ${runUrl}` : ''

  async function withRetry(action, { attempts = 3, retryable = isTransient, what = '요청' } = {}) {
    for (let attempt = 1; ; attempt += 1) {
      try {
        return await action()
      } catch (error) {
        if (!retryable(error) || attempt >= attempts) throw error
        log(`${what}을 잠시 뒤 다시 시도합니다 — ${error.message}`)
        await sleep(RETRY_MS)
      }
    }
  }

  async function runChecks(pr) {
    const since = now()
    let runId = null
    let url = null
    let reruns = 0
    let staleAttempt = 0 // 다시 실행을 요청한 시도 번호. 그보다 새 시도가 끝나야 결과로 본다.
    try {
      // 최근 API는 만든 run의 번호를 돌려준다. 돌려주지 않으면 같은 커밋의 run을 찾는다.
      const dispatched = await withRetry(
        () => api('POST', `/repos/${repo}/actions/workflows/${CHECKS_WORKFLOW}/dispatches`, { ref: pr.branch }),
        { what: `${pr.key} 검사 실행 요청` },
      )
      runId = dispatched?.workflow_run_id ?? null
      url = dispatched?.html_url ?? null
    } catch (error) {
      return { conclusion: 'not_started', url: null, detail: error.message }
    }
    while (now() < since + timeoutMs) {
      try {
        if (!runId) {
          const query = `event=workflow_dispatch&branch=${encodeURIComponent(pr.branch)}&head_sha=${pr.sha}&per_page=20`
          const data = await api('GET', `/repos/${repo}/actions/workflows/${CHECKS_WORKFLOW}/runs?${query}`)
          const run = pickChecksRun(data?.workflow_runs, { sha: pr.sha, since })
          if (run) {
            runId = run.id
            url = run.html_url
          }
        }
        if (runId) {
          const run = await api('GET', `/repos/${repo}/actions/runs/${runId}`)
          url = run.html_url || url
          const attempt = run.run_attempt || 1
          if (run.status === 'completed' && attempt > staleAttempt) {
            const finished = { conclusion: run.conclusion, sha: run.head_sha, url, attempts: attempt }
            if (run.conclusion !== 'failure' || reruns >= CHECK_RERUNS) return finished
            try {
              await withRetry(() => api('POST', `/repos/${repo}/actions/runs/${runId}/rerun-failed-jobs`), { what: `${pr.key} 검사 다시 실행` })
            } catch (error) {
              log(`${pr.key}: 실패한 검사를 다시 실행하지 못했습니다 — ${error.message}`)
              return finished
            }
            reruns += 1
            staleAttempt = attempt
            log(`${pr.key}: Repository checks가 실패해 실패한 job만 한 번 다시 실행합니다(일시 오류 대비) — ${url}`)
          }
        }
      } catch (error) {
        log(`${pr.key}: 검사 상태를 읽지 못했습니다(다시 시도) — ${error.message}`)
      }
      await sleep(pollMs)
    }
    return { conclusion: 'timed_out', url }
  }

  async function block(pr, reason, checksUrl) {
    result.blocked.push({ ...pr, reason })
    log(`${pr.key}: #${pr.number} 병합하지 않음 — ${reason}`)
    try {
      await ensureLabel(MERGE_BLOCKED_LABEL, '자동 병합하지 못한 썸네일 PR (사람이 확인)', 'fbca04', { api, repo })
      await api('POST', `/repos/${repo}/issues/${pr.number}/labels`, { labels: [MERGE_BLOCKED_LABEL] })
      await api('POST', `/repos/${repo}/issues/${pr.number}/comments`, {
        body: [
          `자동으로 병합하지 않았습니다: ${reason}`,
          '',
          `- 검사: ${checksUrl || '없음'}${runLine}`,
          '',
          '확인한 뒤 직접 병합하거나 닫아 주세요. 사람이 병합하면 공개 사이트와 관리자 배포는 push로 자동 실행됩니다.',
        ].join('\n'),
      })
    } catch (error) {
      result.errors.push(`${pr.key} #${pr.number}: 병합 보류 표시를 남기지 못했습니다 — ${error.message}`)
    }
  }

  async function quietly(action, ignoreStatuses = []) {
    try {
      await action()
    } catch (error) {
      if (!ignoreStatuses.includes(error.status)) log(`정리 작업 실패(무시): ${error.message}`)
    }
  }

  // sha를 함께 보내 검사한 커밋 그대로일 때만 병합한다. 바로 앞 PR을 병합한 직후에는 GitHub가 병합 가능 여부를
  // 다시 계산하는 동안 405(Base branch was modified 등)를 줄 수 있어 잠시 뒤 다시 시도한다(5xx·네트워크 오류도).
  // 409(커밋 바뀜)·422는 다시 하지 않는다.
  const mergeWithRetry = (pr) => withRetry(
    () => api('PUT', `/repos/${repo}/pulls/${pr.number}/merge`, { merge_method: 'merge', sha: pr.sha }),
    { attempts: MERGE_ATTEMPTS, retryable: (error) => error.status === 405 || isTransient(error), what: `${pr.key} 병합` },
  )

  // 1. 모든 PR의 검사를 함께 실행하고 기다린다.
  const checks = new Map(await Promise.all(valid.map(async (pr) => [pr.number, await runChecks(pr)])))

  // 2. 고른 순서(새 글 먼저, 최신순)대로 하나씩 병합한다. 서로 다른 파일만 바꾸므로 충돌하지 않는다.
  for (const pr of valid) {
    const check = checks.get(pr.number)
    let current
    try {
      current = await api('GET', `/repos/${repo}/pulls/${pr.number}`)
    } catch (error) {
      await block(pr, `PR을 읽지 못했습니다 (${error.message}).`, check.url)
      continue
    }
    const decision = mergeDecision({ pr: current, expectedSha: pr.sha, checks: check })
    if (decision.action === 'skip') {
      result.skipped.push({ ...pr, reason: decision.reason })
      log(`${pr.key}: #${pr.number} 건너뜀 — ${decision.reason}`)
      continue
    }
    if (decision.action === 'block') {
      await block(pr, decision.reason, check.url)
      continue
    }
    let merged
    try {
      merged = await mergeWithRetry(pr)
    } catch (error) {
      await block(pr, `병합하지 못했습니다 (${error.message}).`, check.url)
      continue
    }
    result.merged.push({ ...pr, mergeSha: merged?.sha || null })
    log(`${pr.key}: #${pr.number} 병합 ${merged?.sha || ''}`.trim())
    await quietly(() => api('POST', `/repos/${repo}/issues/${pr.number}/comments`, {
      body: `Repository checks를 통과해 자동으로 병합했습니다. 이 실행이 공개 사이트와 관리자 배포를 시작합니다.\n\n- 검사: ${check.url || '없음'}${runLine}`,
    }))
    await quietly(() => api('DELETE', `/repos/${repo}/issues/${pr.number}/labels/${encodeURIComponent(MERGE_BLOCKED_LABEL)}`), [404])
    // 병합한 뒤에는 main의 버전 기록으로 같은 내용을 다시 만들지 않으므로 브랜치가 필요 없다.
    await quietly(() => api('DELETE', `/repos/${repo}/git/refs/heads/${pr.branch}`), [404, 422])
  }

  // 3. 병합한 것이 있으면 배포를 한 번씩 실행한다. 실행 시점의 main을 쓰므로 이번에 병합한 썸네일이 모두 들어간다.
  if (result.merged.length) {
    for (const workflow of DEPLOY_WORKFLOWS) {
      try {
        await withRetry(() => api('POST', `/repos/${repo}/actions/workflows/${workflow}/dispatches`, { ref: 'main' }), { what: `${workflow} 실행 요청` })
        result.deployed.push(workflow)
      } catch (error) {
        result.errors.push(`${workflow} 실행 요청 실패: ${error.message}`)
      }
    }
  }
  return result
}

function summarize(result) {
  const link = (pr) => `[#${pr.number}](${pr.url})`
  return [
    ...result.merged.map((pr) => `- ${pr.key}: ${link(pr)} 자동 병합`),
    ...result.blocked.map((pr) => `- ${pr.key}: ${link(pr)} 병합하지 않음 — ${pr.reason}`),
    ...result.skipped.map((pr) => `- ${pr.key}: ${link(pr)} 건너뜀 — ${pr.reason}`),
    ...(result.deployed.length ? [`- 배포 실행: ${result.deployed.join(', ')}`] : []),
    ...result.errors.map((error) => `- 오류: ${error}`),
  ]
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const prs = JSON.parse(process.env.PRS || '[]')
  if (process.env.DRY_RUN === '1') {
    for (const pr of prs) {
      const problem = publishedPrProblem(pr)
      console.log(problem
        ? `[dry run] ${pr?.key} #${pr?.number}: 건너뜀 — ${problem}`
        : `[dry run] ${pr.key} #${pr.number}: ${pr.branch}에서 ${CHECKS_WORKFLOW} 실행 → 통과하면 ${pr.sha.slice(0, 7)} 병합, 브랜치 삭제`)
    }
    console.log(`[dry run] 하나라도 병합하면 ${DEPLOY_WORKFLOWS.join(', ')} 실행`)
  } else {
    const timeoutMinutes = Number(process.env.CHECKS_TIMEOUT_MINUTES) > 0 ? Number(process.env.CHECKS_TIMEOUT_MINUTES) : 30
    const result = await mergeThumbnails({
      prs, api: github, repo: repository(), runUrl: process.env.RUN_URL || '', timeoutMs: timeoutMinutes * MINUTE,
    })
    const lines = summarize(result)
    if (process.env.GITHUB_STEP_SUMMARY && lines.length) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, ['### 자동 병합', '', ...lines, ''].join('\n'))
    }
    console.log(lines.join('\n') || '병합할 PR이 없습니다.')
    if (result.blocked.length || result.errors.length) process.exitCode = 1
  }
}
