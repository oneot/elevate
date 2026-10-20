/**
 * MSAL redirect URI를 현재 접속한 호스트 기준으로 정한다.
 *
 * 같은 빌드가 Static Web Apps 기본 호스트(*.azurestaticapps.net)와 사용자 지정 도메인
 * (admin.microsoft-elevate.com)에서 함께 서비스되므로, 빌드 시점의 절대 URL 하나로는 두 호스트를
 * 모두 지원할 수 없다. Entra는 리디렉션 URI를 끝 슬래시까지 정확히 비교한다.
 *
 * - 설정값이 없으면 현재 origin(끝 슬래시 없음, 예: https://admin.microsoft-elevate.com)을 쓴다.
 * - 설정값이 현재 origin과 같은 호스트의 절대 URL이면 설정 문자열을 그대로 쓴다.
 * - 설정값이 '/'로 시작하는 경로면 현재 origin 뒤에 붙인다.
 * - 다른 호스트의 URL이거나 해석할 수 없으면 무시하고 현재 origin을 쓴다.
 *
 * @param {string|undefined} configured VITE_AZURE_AD_REDIRECT_URI 값
 * @param {string} origin 현재 window.location.origin
 * @returns {string}
 */
export function resolveRedirectUri(configured, origin) {
  const value = typeof configured === 'string' ? configured.trim() : ''
  if (!value) return origin
  if (value.startsWith('/') && !value.startsWith('//')) return `${origin}${value}`
  try {
    return new URL(value).origin === origin ? value : origin
  } catch {
    return origin
  }
}
