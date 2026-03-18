import { useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../lib/msalConfig.js'

export function useAuth() {
  const { accounts, inProgress, instance } = useMsal()
  const account = instance.getActiveAccount() || accounts[0] || null

  useEffect(() => {
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
