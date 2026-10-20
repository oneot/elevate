/**
 * AI가 쓴 요약 한 줄을 게시글에 기재한다: 서버 PUT /api/automation/posts/{id}/excerpt.
 * 비밀값 없이 GitHub OIDC 토큰으로 인증한다(job 권한 id-token: write). 서버는 oneot/elevate main의
 * 'Post thumbnails'(post-thumbnails.yml)에서 나온 토큰만 받는다 (Elevate.Server/src/middleware/automationAuth.js).
 */
import { checkExcerpt } from './pipeline.mjs'
import { parseKey } from './posts.mjs'

export const EXCERPT_AUDIENCE = process.env.AUTOMATION_OIDC_AUDIENCE || 'api://elevate-post-automation'

/** Actions job 안에서 이 서버용 GitHub OIDC 토큰을 받는다. */
export async function getActionsIdToken(audience, { env = process.env, fetchImpl = fetch } = {}) {
  const url = env.ACTIONS_ID_TOKEN_REQUEST_URL
  const requestToken = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
  if (!url || !requestToken) throw new Error('GitHub OIDC 토큰을 받을 수 없습니다(job 권한에 id-token: write가 필요합니다).')
  const res = await fetchImpl(`${url}${url.includes('?') ? '&' : '?'}audience=${encodeURIComponent(audience)}`, {
    headers: { authorization: `bearer ${requestToken}` },
  })
  if (!res.ok) throw new Error(`GitHub OIDC 토큰 요청 실패: HTTP ${res.status}`)
  const data = await res.json()
  if (!data?.value) throw new Error('GitHub OIDC 토큰 응답이 비어 있습니다.')
  return data.value
}

/**
 * @param {{ source: { key: string, id: string, title: string, excerpt?: string|null, postUpdatedAt: string },
 *   baseUrl: string, audience?: string, getToken?: (audience: string) => Promise<string>,
 *   fetchImpl?: typeof fetch, sleep?: (ms: number) => Promise<void>, attempts?: number, retryMs?: number }} options
 * @returns {Promise<{ status: 'written'|'skipped'|'failed', note: string }>}
 *   skipped: 쓸 요약이 없거나, 그 사이 글이 바뀌었거나(409), 서버에 입구·글이 없음(404). failed: 인증·서버 오류.
 */
export async function writeExcerpt({
  source, baseUrl, audience = EXCERPT_AUDIENCE, getToken = getActionsIdToken, fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), attempts = 3, retryMs = 10_000,
}) {
  const excerpt = String(source?.excerpt ?? '').trim()
  if (!excerpt) return { status: 'skipped', note: 'AI 요약이 없어 기재하지 않음' }
  const problems = checkExcerpt(excerpt, { title: source.title })
  if (problems.length) return { status: 'skipped', note: `요약 규칙에 맞지 않아 기재하지 않음: ${problems.join(' ')}` }
  if (!source.id || !source.postUpdatedAt) return { status: 'skipped', note: '글 번호나 수정 시각이 없어 기재하지 않음' }

  let token
  try {
    token = await getToken(audience)
  } catch (error) {
    return { status: 'failed', note: error.message }
  }
  const url = `${baseUrl}/posts/${encodeURIComponent(source.id)}/excerpt`
  const body = JSON.stringify({ excerpt, slug: parseKey(source.key).slug, expectedUpdatedAt: source.postUpdatedAt })
  for (let attempt = 1; ; attempt += 1) {
    let res
    try {
      res = await fetchImpl(url, {
        method: 'PUT',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' },
        body,
      })
    } catch (error) {
      if (attempt < attempts) {
        await sleep(retryMs)
        continue
      }
      return { status: 'failed', note: `서버에 연결하지 못함: ${error.message}` }
    }
    if (res.ok) return { status: 'written', note: '게시글에 기재함' }
    if (res.status === 409) return { status: 'skipped', note: '그 사이 글이 바뀌어 기재하지 않음(다음 저장 때 다시 만듭니다)' }
    if (res.status === 404) return { status: 'skipped', note: '서버에 요약 입구가 없거나 글이 없어 기재하지 않음' }
    if (res.status >= 500 && attempt < attempts) {
      await sleep(retryMs)
      continue
    }
    const detail = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200)
    return { status: 'failed', note: `서버가 거절함: HTTP ${res.status} ${detail}`.trim() }
  }
}
