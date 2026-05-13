import { LogLevel } from '@azure/msal-browser'

/**
 * MSAL PublicClientApplication 초기화 설정.
 *
 * auth.clientId / authority / redirectUri 는 환경 변수에서 주입되므로
 * 배포 환경별로 .env 파일을 통해 관리한다.
 * navigateToLoginRequestUrl: true — 로그인 완료 후 원래 요청 URL로 복귀.
 * cacheLocation: 'sessionStorage' — 탭 단위 세션으로 범위를 제한해
 * 동일 브라우저의 다른 탭과 인증 상태를 공유하지 않는다.
 */
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID,
    authority: import.meta.env.VITE_AZURE_AD_AUTHORITY,
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        // PII(개인 식별 정보)가 포함된 로그는 출력하지 않는다.
        if (containsPii) return
      },
      logLevel: LogLevel.Warning,
    },
  },
}

/**
 * 인증(로그인) 팝업/리디렉션 시 사용하는 스코프.
 * 로그인 화면에서 사용자가 동의하는 권한 범위를 선언한다.
 */
export const loginRequest = {
  scopes: [import.meta.env.VITE_AZURE_AD_API_SCOPE],
}

/**
 * 이미 로그인된 상태에서 API 액세스 토큰을 발급받을 때 사용하는 스코프.
 * loginRequest 와 동일한 스코프를 사용하지만 목적이 다르므로 분리 선언한다:
 * - loginRequest: 인증 흐름 진입 시 (redirect/popup)
 * - tokenRequest: silent 토큰 갱신 시 (acquireTokenSilent)
 */
export const tokenRequest = {
  scopes: [import.meta.env.VITE_AZURE_AD_API_SCOPE],
}
