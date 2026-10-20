// GitHub Actions가 서버에 직접 쓰는 요청(예: AI가 쓴 게시글 요약 기재)을 인증한다.
// 비밀값 없이 GitHub OIDC 토큰을 쓴다. Actions job이 이 서버를 audience로 하는 짧은 토큰을 받아 보내면,
// GitHub 공개 키로 서명을 확인하고, 허용한 저장소·브랜치·workflow에서 나온 토큰인지 claim으로 확인한다.
// 기본값은 oneot/elevate main 브랜치의 'Post thumbnails'(post-thumbnails.yml)만 허용한다.

const { createRemoteJWKSet, jwtVerify } = require('jose');
const { AuthError, extractBearerToken, getAuthorizationHeader } = require('./auth');

const GITHUB_OIDC_ISSUER = 'https://token.actions.githubusercontent.com';

const DEFAULTS = {
  audience: 'api://elevate-post-automation',
  repository: 'oneot/elevate',
  repositoryId: '1125077519',
  workflow: 'post-thumbnails.yml',
  ref: 'refs/heads/main'
};

function readSetting(env, name, fallback) {
  const value = typeof env[name] === 'string' ? env[name].trim() : '';
  return value || fallback;
}

function getAutomationConfig(env = process.env) {
  return {
    audience: readSetting(env, 'AUTOMATION_OIDC_AUDIENCE', DEFAULTS.audience),
    repository: readSetting(env, 'AUTOMATION_GITHUB_REPOSITORY', DEFAULTS.repository),
    repositoryId: readSetting(env, 'AUTOMATION_GITHUB_REPOSITORY_ID', DEFAULTS.repositoryId),
    workflow: readSetting(env, 'AUTOMATION_GITHUB_WORKFLOW', DEFAULTS.workflow),
    ref: readSetting(env, 'AUTOMATION_GITHUB_REF', DEFAULTS.ref)
  };
}

let githubJwks;

function getGithubJwks() {
  if (!githubJwks) {
    githubJwks = createRemoteJWKSet(new URL(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`));
  }
  return githubJwks;
}

/**
 * 서명을 확인한 토큰이 허용한 저장소·브랜치·workflow에서 나왔는지 본다 (순수 함수).
 * repository_id는 저장소 이름이 바뀌거나 같은 이름으로 다시 만들어져도 달라지는 번호라 함께 확인한다.
 * @returns {string|null} 맞지 않는 claim 이름
 */
function automationClaimProblem(payload, config) {
  if (payload.repository !== config.repository) return 'repository';
  if (String(payload.repository_id) !== config.repositoryId) return 'repository_id';
  if (payload.ref !== config.ref) return 'ref';
  if (payload.workflow_ref !== `${config.repository}/.github/workflows/${config.workflow}@${config.ref}`) return 'workflow_ref';
  return null;
}

/**
 * @param requestLike Azure Functions 요청 (authorization 헤더)
 * @param {{ env?: object, key?: any }} [options] key는 테스트에서 공개 키를 바꿔 끼운다
 * @returns {Promise<{ workflowRef: string, runId: string|null, sha: string|null }>}
 */
async function authorizeAutomationRequest(requestLike, { env = process.env, key } = {}) {
  const config = getAutomationConfig(env);
  const token = extractBearerToken(getAuthorizationHeader(requestLike));
  if (!token) {
    throw new AuthError(401, 'Unauthorized', 'Missing or invalid access token');
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, key || getGithubJwks(), {
      issuer: GITHUB_OIDC_ISSUER,
      audience: config.audience,
      algorithms: ['RS256']
    }));
  } catch (error) {
    console.warn(`[automationAuth] rejected token: ${error.code || error.message}`);
    throw new AuthError(401, 'Unauthorized', 'Missing or invalid access token');
  }

  const problem = automationClaimProblem(payload, config);
  if (problem) {
    console.warn(`[automationAuth] rejected token: ${problem} is not allowed (${payload.workflow_ref || 'no workflow_ref'})`);
    throw new AuthError(403, 'Forbidden', 'This workflow is not allowed to call this endpoint');
  }

  return {
    workflowRef: payload.workflow_ref,
    runId: payload.run_id ? String(payload.run_id) : null,
    sha: payload.sha || null
  };
}

module.exports = {
  GITHUB_OIDC_ISSUER,
  authorizeAutomationRequest,
  automationClaimProblem,
  getAutomationConfig
};
