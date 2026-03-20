import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { tokenRequest } from './msalConfig.js'

const DEV_BEARER_TOKEN = import.meta.env.VITE_DEV_BEARER_TOKEN || ''

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

export async function getApiAccessToken(msalInstance, options = {}) {
  if (DEV_BEARER_TOKEN) {
    return DEV_BEARER_TOKEN
  }

  if (!msalInstance) {
    throw new Error('MSAL_INSTANCE_REQUIRED')
  }

  const account = getAccount(msalInstance)

  if (!account) {
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
      await msalInstance.acquireTokenRedirect(tokenRequest)
      return ''
    }

    throw error
  }
}
