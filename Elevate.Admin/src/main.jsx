import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EventType, PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.jsx'
import { msalConfig } from './lib/msalConfig.js'

// 1단계: MSAL 인스턴스 생성 및 초기화.
//        initialize()는 비동기이므로 top-level await로 완료를 보장한다.
const msalInstance = new PublicClientApplication(msalConfig)
await msalInstance.initialize()

// 2단계: 로그인/토큰 성공 이벤트를 구독해 활성 계정을 자동 설정한다.
//        이 핸들러가 없으면 redirect 완료 후 계정이 활성화되지 않을 수 있다.
msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
    event.payload?.account
  ) {
    msalInstance.setActiveAccount(event.payload.account)
  }
})

// 3단계: 리디렉션 응답을 처리한다.
//        로그인 redirect 완료 후 앱이 재로드될 때 응답을 소비해야
//        다음 acquireTokenSilent 호출이 올바르게 동작한다.
const redirectResponse = await msalInstance.handleRedirectPromise()
if (redirectResponse?.account) {
  msalInstance.setActiveAccount(redirectResponse.account)
}

// 4단계: 이미 로그인된 계정이 있으면 첫 번째 계정을 활성 계정으로 설정한다.
//        페이지 새로고침 후 캐시에 계정이 남아 있는 경우를 처리한다.
if (!msalInstance.getActiveAccount()) {
  const [firstAccount] = msalInstance.getAllAccounts()
  if (firstAccount) {
    msalInstance.setActiveAccount(firstAccount)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MsalProvider>
  </StrictMode>,
)
