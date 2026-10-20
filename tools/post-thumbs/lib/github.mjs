/** GitHub REST 호출 (Actions의 GITHUB_TOKEN). */
const API = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '')

export function repository() {
  const repo = process.env.GITHUB_REPOSITORY
  if (!repo) throw new Error('GITHUB_REPOSITORY가 없습니다.')
  return repo
}

export async function github(method, path, body) {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN이 없습니다.')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const error = new Error(`${method} ${path} → ${res.status} ${data?.message || res.statusText}`)
    error.status = res.status
    throw error
  }
  return data
}

/** 라벨이 없으면 만든다. api·repo는 테스트에서 바꿔 끼운다. */
export async function ensureLabel(name, description, color, { api = github, repo = repository() } = {}) {
  try {
    await api('GET', `/repos/${repo}/labels/${encodeURIComponent(name)}`)
  } catch (error) {
    if (error.status !== 404) throw error
    await api('POST', `/repos/${repo}/labels`, { name, description, color })
  }
}
