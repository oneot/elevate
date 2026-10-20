import { useEffect, useRef, useState } from 'react'
import { InteractionStatus } from '@azure/msal-browser'
import { useAuth } from '../../hooks/useAuth.js'
import { isApiConfigured } from '../../lib/apiClient.js'
import { hasDevBearerToken } from '../../lib/authToken.js'
import { clearSignedOut, isSignedOut } from '../../lib/signOutFlag.js'
import MicrosoftMark from './MicrosoftMark.jsx'

const LOGIN_ERROR = '로그인 페이지로 이동하지 못했습니다. 잠시 후 다시 시도해 주세요.'

/**
 * 로그인한 사용자에게만 관리자 화면을 보여 준다. 로그인 계정이 없으면 한 번만
 * Microsoft 로그인 페이지로 이동한다 (여러 API 요청이 동시에 로그인을 시작하지 않게 한다).
 * 로그아웃 직후에는 바로 다시 로그인시키지 않고 안내와 '다시 로그인' 버튼을 보여 준다.
 * API가 연결되지 않은 목업 모드와 로컬 개발용 토큰(VITE_DEV_BEARER_TOKEN)은 로그인 없이 연다.
 */
export default function AuthGate({ children }) {
  const { isAuthenticated, inProgress, login } = useAuth()
  const bypass = !isApiConfigured || hasDevBearerToken
  const startedRef = useRef(false)
  const [signedOut, setSignedOut] = useState(isSignedOut)
  const [error, setError] = useState('')
  const shouldLogin = !bypass && !signedOut && !isAuthenticated && inProgress === InteractionStatus.None

  useEffect(() => {
    if (isAuthenticated) clearSignedOut()
  }, [isAuthenticated])

  useEffect(() => {
    if (!shouldLogin || startedRef.current) return
    startedRef.current = true
    login().catch((loginError) => {
      console.error('[AuthGate] 로그인 시작 실패', loginError)
      setError(LOGIN_ERROR)
    })
  }, [shouldLogin, login])

  if (bypass || isAuthenticated) return children

  const startLogin = () => {
    clearSignedOut()
    setSignedOut(false)
    setError('')
    startedRef.current = true
    login().catch((loginError) => {
      console.error('[AuthGate] 로그인 재시도 실패', loginError)
      setError(LOGIN_ERROR)
    })
  }

  let body
  if (error) {
    body = (
      <>
        <p>{error}</p>
        <button type="button" className="ea-btn ea-btn--primary" onClick={startLogin}>다시 로그인</button>
      </>
    )
  } else if (signedOut) {
    body = (
      <>
        <p>로그아웃되었습니다.</p>
        <button type="button" className="ea-btn ea-btn--primary" onClick={startLogin}>다시 로그인</button>
      </>
    )
  } else {
    body = (
      <>
        <span className="ea-spinner" aria-hidden="true" />
        <p>Microsoft 계정 로그인 페이지로 이동하고 있습니다.</p>
      </>
    )
  }

  return (
    <div className="ea ea-center">
      <div className="ea-center__card" role={error ? 'alert' : 'status'}>
        <MicrosoftMark size={32} />
        <h1>Microsoft Elevate 관리자</h1>
        {body}
      </div>
    </div>
  )
}
