import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { tokenRequest } from './msalConfig.js'

/**
 * VITE_DEV_BEARER_TOKEN 이 설정된 경우 MSAL 없이 해당 토큰을 직접 사용한다.
 * 로컬 개발 환경에서 MSAL 인증 흐름 없이 API를 빠르게 테스트할 때 활용한다.
 * 프로덕션 환경에서는 절대 설정하지 않는다.
 */
const DEV_BEARER_TOKEN = import.meta.env.VITE_DEV_BEARER_TOKEN || ''

/**
 * 현재 활성 계정을 반환한다.
 * 활성 계정이 없으면 첫 번째 계정을 활성 계정으로 설정하고 반환한다.
 * 계정이 하나도 없으면 null 을 반환한다.
 * @param {import('@azure/msal-browser').IPublicClientApplication} msalInstance
 * @returns {import('@azure/msal-browser').AccountInfo | null}
 */
function getAccount(msalInstance) {
  const activeAccount = msalInstance.getActiveAccount()
  if (activeAccount) {
    return activeAccount
  }

  const [firstAccount] = msalInstance.getAllAccounts()
  if (firstAccount) {
    msalInstance.setActiveAccount(firstAccount)
  }

  return firstAccount || null
}

/**
 * API 호출에 사용할 Bearer 액세스 토큰을 획득한다.
 *
 * 우선순위:
 * 1. DEV_BEARER_TOKEN 이 설정되어 있으면 즉시 반환 (개발 전용 bypass)
 * 2. acquireTokenSilent — 캐시에서 토큰을 조회하거나 백그라운드 갱신 시도
 * 3. InteractionRequiredAuthError 발생 시 → acquireTokenRedirect로 로그인 페이지로 이동
 *    (이동 후 빈 문자열 반환 — 반환 후 렌더링이 중단되므로 의미 없음)
 *
 * @param {import('@azure/msal-browser').IPublicClientApplication} msalInstance
 * @param {{ forceRefresh?: boolean }} [options]
 * @returns {Promise<string>} 액세스 토큰 (빈 문자열이면 redirect 중)
 */
export async function getApiAccessToken(msalInstance, options = {}) {
  if (DEV_BEARER_TOKEN) {
    return DEV_BEARER_TOKEN
  }

  if (!msalInstance) {
    throw new Error('MSAL_INSTANCE_REQUIRED')
  }

  const account = getAccount(msalInstance)

  if (!account) {
    // 로그인된 계정이 없으면 로그인 페이지로 이동한다.
    await msalInstance.acquireTokenRedirect(tokenRequest)
    return ''
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...tokenRequest,
      account,
      forceRefresh: options.forceRefresh === true,
    })

    return response.accessToken
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // 캐시 토큰이 만료되었거나 MFA 등 추가 인증이 필요한 경우 리디렉션한다.
      await msalInstance.acquireTokenRedirect(tokenRequest)
      return ''
    }

    throw error
  }
}
