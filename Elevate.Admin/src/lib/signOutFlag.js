/**
 * 로그아웃 직후 표시. 로그아웃 후 같은 호스트로 돌아오면 자동 로그인 대신 안내 화면을 보여 주기 위해
 * 탭 단위(sessionStorage)로 기록한다. MSAL은 로그아웃 시 자신의 캐시만 지우므로 이 값은 남는다.
 */
const SIGNED_OUT_KEY = 'elevate.admin.signedOut'

export function markSignedOut() {
  try {
    sessionStorage.setItem(SIGNED_OUT_KEY, '1')
  } catch {
    // 저장소를 쓸 수 없으면 로그아웃 후 바로 로그인 화면으로 이동한다.
  }
}

export function isSignedOut() {
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function clearSignedOut() {
  try {
    sessionStorage.removeItem(SIGNED_OUT_KEY)
  } catch {
    // 무시: 다음 로그인 흐름에는 영향이 없다.
  }
}
