import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EventType, PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.jsx'
import { msalConfig } from './lib/msalConfig.js'

const msalInstance = new PublicClientApplication(msalConfig)
await msalInstance.initialize()

msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
    event.payload?.account
  ) {
    msalInstance.setActiveAccount(event.payload.account)
  }
})

const redirectResponse = await msalInstance.handleRedirectPromise()
if (redirectResponse?.account) {
  msalInstance.setActiveAccount(redirectResponse.account)
}

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
