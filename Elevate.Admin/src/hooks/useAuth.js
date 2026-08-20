import { useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../lib/msalConfig.js'

/**
 * MSAL 인증 상태와 로그인 함수를 제공하는 훅.
 *
 * - account: 현재 활성 계정 (없으면 첫 번째 계정, 그것도 없으면 null)
 * - inProgress: MSAL 인증 작업 진행 중 여부 (InteractionStatus)
 * - isAuthenticated: 로그인 여부
 * - login: 로그인 페이지로 이동하는 함수
 * - msalInstance: 토큰 획득 등 직접 MSAL 조작이 필요한 컴포넌트에 전달
 */
export function useAuth() {
  const { accounts, inProgress, instance } = useMsal()
  const account = instance.getActiveAccount() || accounts[0] || null

  useEffect(() => {
    // 활성 계정이 없는데 accounts 배열에 계정이 있으면 첫 번째 계정을 활성화한다.
    // main.jsx에서 이미 처리하지만 계정 목록이 비동기로 늦게 도착하는 경우를 대비한다.
    if (!instance.getActiveAccount() && accounts.length > 0) {
      instance.setActiveAccount(accounts[0])
    }
  }, [accounts, instance])

  const login = async () => {
    await instance.acquireTokenRedirect(loginRequest)
  }

  return {
    account,
    inProgress,
    isAuthenticated: Boolean(account),
    login,
    msalInstance: instance,
  }
}
