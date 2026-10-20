// 관리자에서 글을 '게시' 상태로 저장하면 GitHub Actions 'Post thumbnails on save'를 실행해 AI 썸네일 작업을 요청한다.
// workflow는 마지막 저장 뒤 몇 분 기다렸다가 새 글과 내용이 바뀐 글의 썸네일만 만든다(tools/post-thumbs/README.md).
// 토큰(THUMBNAIL_DISPATCH_TOKEN)이 없으면 아무것도 하지 않고, 요청이 실패해도 저장 결과에는 영향을 주지 않는다.

const DEFAULT_REPOSITORY = 'oneot/elevate';
const DEFAULT_WORKFLOW = 'post-thumbnails-on-save.yml';
const DEFAULT_REF = 'main';
const REQUEST_TIMEOUT_MS = 5000;
const REPOSITORY_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const WORKFLOW_PATTERN = /^[A-Za-z0-9_.-]+\.ya?ml$/;

function readSetting(env, name, fallback) {
  const value = typeof env[name] === 'string' ? env[name].trim() : '';
  return value || fallback;
}

function getThumbnailTriggerConfig(env = process.env) {
  const token = readSetting(env, 'THUMBNAIL_DISPATCH_TOKEN', '');
  if (!token) return null;

  const repository = readSetting(env, 'THUMBNAIL_DISPATCH_REPOSITORY', DEFAULT_REPOSITORY);
  const workflow = readSetting(env, 'THUMBNAIL_DISPATCH_WORKFLOW', DEFAULT_WORKFLOW);
  const ref = readSetting(env, 'THUMBNAIL_DISPATCH_REF', DEFAULT_REF);
  if (!REPOSITORY_PATTERN.test(repository) || !WORKFLOW_PATTERN.test(workflow)) {
    console.warn('[thumbnailTrigger] THUMBNAIL_DISPATCH_REPOSITORY or THUMBNAIL_DISPATCH_WORKFLOW is invalid; skipping');
    return null;
  }

  return { token, repository, workflow, ref };
}

async function readErrorDetail(response) {
  try {
    const text = (await response.text()).replace(/\s+/g, ' ').trim();
    return text ? ` ${text.slice(0, 200)}` : '';
  } catch {
    return '';
  }
}

/**
 * @returns {Promise<'requested'|'skipped'|'disabled'|'failed'>} 저장 응답에는 쓰지 않고 로그·테스트에만 쓴다. 예외를 던지지 않는다.
 */
async function requestPostThumbnail(post, options = {}) {
  const { env = process.env, fetchImpl = globalThis.fetch, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  if (!post || post.status !== 'published') return 'skipped';

  const config = getThumbnailTriggerConfig(env);
  if (!config) return 'disabled';

  const label = `${post.category}/${post.slug}`;
  const url = `https://api.github.com/repos/${config.repository}/actions/workflows/${config.workflow}/dispatches`;
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'elevate-server',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({ ref: config.ref, inputs: { post: label } }),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (response.ok) return 'requested';

    console.warn(`[thumbnailTrigger] dispatch failed for ${label}: HTTP ${response.status}${await readErrorDetail(response)}`);
    return 'failed';
  } catch (error) {
    console.warn(`[thumbnailTrigger] dispatch failed for ${label}: ${error && error.message ? error.message : error}`);
    return 'failed';
  }
}

module.exports = {
  getThumbnailTriggerConfig,
  requestPostThumbnail
};
