import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * 관리자 쉘(Layout)이 페이지에 내려 주는 값.
 * - dbarSlot: 문서 바 오른쪽 영역 DOM. 페이지가 검색창이나 저장 버튼을 createPortal로 넣는다.
 * - setPageApp: 현재 페이지가 다루는 앱을 알려 사이드바 강조와 화면 색을 맞춘다.
 */
export const ShellContext = createContext({ dbarSlot: null, setPageApp: () => {} })

export function useDbarSlot() {
  return useContext(ShellContext).dbarSlot
}

/** 현재 경로가 다루는 앱(또는 'all')을 쉘에 알린다. 경로가 바뀌면 쉘이 자동으로 잊는다. */
export function usePageApp(app) {
  const { setPageApp } = useContext(ShellContext)
  const { pathname } = useLocation()
  useEffect(() => {
    setPageApp({ path: pathname, app: app || null })
  }, [setPageApp, pathname, app])
}

const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribeDesktop(callback) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia(DESKTOP_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function isDesktopNow() {
  return typeof window.matchMedia === 'function' ? window.matchMedia(DESKTOP_QUERY).matches : true
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, isDesktopNow, () => true)
}
