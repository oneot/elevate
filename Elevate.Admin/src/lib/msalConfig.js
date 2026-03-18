import { LogLevel } from '@azure/msal-browser'

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
        if (containsPii) return
        if (import.meta.env.DEV && level >= LogLevel.Warning) {
          console.warn(message)
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
}

export const loginRequest = {
  scopes: [import.meta.env.VITE_AZURE_AD_API_SCOPE],
}

export const tokenRequest = {
  scopes: [import.meta.env.VITE_AZURE_AD_API_SCOPE],
}
