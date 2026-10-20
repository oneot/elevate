import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PanelLeft, X } from 'lucide-react'
import AuthGate from './AuthGate.jsx'
import AdminPostsProvider from './AdminPostsProvider.jsx'
import AppHeader from './AppHeader.jsx'
import AppNavigator from './AppNavigator.jsx'
import PageBoundary from './PageBoundary.jsx'
import { ShellContext, useIsDesktop } from '../../hooks/shell.js'
import { ALL_APPS_KEY, isAppKey } from '../../constants/apps.js'
import { getTintStyle } from '../../constants/appMeta.js'
import { PUBLIC_SITE_URL } from '../../constants/site.js'

const NAV_COLLAPSED_KEY = 'elevate.admin.navCollapsed'

function readCollapsed() {
  try {
    return window.localStorage.getItem(NAV_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function persistCollapsed(value) {
  try {
    window.localStorage.setItem(NAV_COLLAPSED_KEY, value ? '1' : '0')
  } catch {
    // 저장소를 쓸 수 없어도 이번 방문에서는 접기/펼치기가 동작한다.
  }
}

/** 경로만으로 알 수 있는 현재 앱 (목록 /apps/:app, 새 글 /posts/new?app=). */
function getRouteApp(pathname, search) {
  const list = /^\/apps\/([^/]+)\/?$/.exec(pathname)
  if (list) return decodeURIComponent(list[1])
  if (pathname === '/posts/new') {
    const params = new URLSearchParams(search)
    const app = params.get('app') || params.get('category')
    return isAppKey(app) ? app : null
  }
  return null
}

/**
 * 공개 사이트 블로그(/all)와 같은 쉘: 위로 사라지는 헤더, 상단에 붙는 문서 바,
 * 왼쪽 앱 내비게이터(데스크톱 sticky / 모바일 드로어), 앱 색 히어로를 가진 본문.
 */
function Shell() {
  const location = useLocation()
  const { pathname, search } = location
  const isDesktop = useIsDesktop()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [barStuck, setBarStuck] = useState(false)
  const [dbarSlot, setDbarSlot] = useState(null)
  const [pageApp, setPageApp] = useState({ path: '', app: null })
  const navRef = useRef(null)
  const toggleRef = useRef(null)
  const sentinelRef = useRef(null)
  const dbarRef = useRef(null)

  const routeKey = `${pathname}${search}`
  const [drawerRouteKey, setDrawerRouteKey] = useState(routeKey)
  if (drawerRouteKey !== routeKey) {
    setDrawerRouteKey(routeKey)
    setDrawerOpen(false)
  }

  const activeApp = pageApp.path === pathname ? pageApp.app : getRouteApp(pathname, search)
  const tintApp = activeApp === ALL_APPS_KEY || isAppKey(activeApp) ? activeApp : ALL_APPS_KEY

  // 새 화면은 맨 위에서 시작한다.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  // 헤더가 스크롤로 사라지고 문서 바가 상단에 붙으면 반투명 글래스로 바꾼다.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setBarStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // 모바일 드로어: 페이지 스크롤을 잠그고 포커스를 드로어로 옮긴다.
  useEffect(() => {
    if (!drawerOpen || isDesktop) return undefined
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    navRef.current?.focus({ preventScroll: true })
    return () => {
      root.style.overflow = previous
    }
  }, [drawerOpen, isDesktop])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return
      }
      const input = dbarRef.current?.querySelector('.ea-search__input')
      if (!input) return
      event.preventDefault()
      if (drawerOpen) setDrawerOpen(false)
      input.focus({ preventScroll: true })
      input.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const toggleNav = () => {
    if (isDesktop) {
      const next = !collapsed
      setCollapsed(next)
      persistCollapsed(next)
    } else {
      setDrawerOpen((open) => !open)
    }
  }

  // 모바일에서 같은 화면의 링크를 눌러도 드로어를 닫는다.
  const handleNavClick = (event) => {
    if (isDesktop) return
    if (event.target instanceof Element && event.target.closest('.ea-nav__link')) {
      setDrawerOpen(false)
    }
  }

  const stablePageApp = useCallback((value) => {
    setPageApp((previous) => (previous.path === value.path && previous.app === value.app ? previous : value))
  }, [])
  const shell = useMemo(() => ({ dbarSlot, setPageApp: stablePageApp }), [dbarSlot, stablePageApp])
  const navVisible = isDesktop ? !collapsed : drawerOpen

  return (
    <ShellContext.Provider value={shell}>
      <div className="ea" style={getTintStyle(tintApp)}>
        <a className="ea-skip" href="#ea-content">본문 바로가기</a>
        <AppHeader />
        <div ref={sentinelRef} className="ea-dbar-sentinel" aria-hidden="true" />

        <div ref={dbarRef} className="ea-dbar" data-stuck={barStuck ? 'true' : 'false'}>
          <div className="ea-dbar__inner">
            <button
              ref={toggleRef}
              type="button"
              className="ea-iconbtn"
              aria-controls="ea-nav"
              aria-expanded={navVisible}
              aria-label={navVisible ? '사이드바 닫기' : '사이드바 열기'}
              title={navVisible ? '사이드바 닫기' : '사이드바 열기'}
              onClick={toggleNav}
            >
              <PanelLeft size={19} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <Link to={`/apps/${ALL_APPS_KEY}`} className="ea-dbar__title">게시글</Link>
            <div ref={setDbarSlot} className="ea-dbar__slot" />
          </div>
        </div>

        <div className="ea-body">
          <aside
            id="ea-nav"
            ref={navRef}
            className="ea-nav"
            tabIndex={-1}
            aria-label="앱 탐색"
            data-open={drawerOpen ? 'true' : 'false'}
            data-collapsed={isDesktop && collapsed ? 'true' : 'false'}
            onClick={handleNavClick}
          >
            <button
              type="button"
              className="ea-iconbtn ea-nav__close"
              aria-label="사이드바 닫기"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <AppNavigator activeApp={activeApp} />
          </aside>

          <main id="ea-content" className="ea-main">
            <PageBoundary key={pathname}>
              <Suspense fallback={<p role="status" className="ea-container ea-section ea-count">페이지를 불러오는 중...</p>}>
                <Outlet />
              </Suspense>
            </PageBoundary>
          </main>
        </div>

        <footer className="ea-footer">
          <div className="ea-footer__inner">
            <span>&copy; 2026 Microsoft Elevate Korea · 관리자</span>
            <a href={PUBLIC_SITE_URL} target="_blank" rel="noopener noreferrer">공개 사이트 열기</a>
          </div>
        </footer>

        {drawerOpen && !isDesktop && <div className="ea-scrim" aria-hidden="true" onClick={() => setDrawerOpen(false)} />}
      </div>
    </ShellContext.Provider>
  )
}

function Layout() {
  return (
    <AuthGate>
      <AdminPostsProvider>
        <Shell />
      </AdminPostsProvider>
    </AuthGate>
  )
}

export default Layout
