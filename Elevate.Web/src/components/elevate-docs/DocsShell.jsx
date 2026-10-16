/**
 * @file DocsShell.jsx
 * @description Apple Developer Documentation 스타일의 블로그 레이아웃 쉘.
 *
 * - 홈 화면과 같은 상단 헤더(Navigation)는 스크롤하면 위로 사라지고(Apple Developer처럼),
 *   그 아래 문서 바만 상단에 붙어 남는다. 붙은 뒤에는 살짝 리퀴드 글래스로 바뀐다.
 * - 왼쪽 내비게이터(데스크톱: sticky 사이드바 / 모바일: 드로어)
 * - `/` 키로 내비게이터 필터에 포커스
 * 블로그 목록(PostList)·상세(PostDetail)와 활동 사례(ActivityShowcasePage) 화면에서 사용한다.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListTree, PanelLeft, Search, X } from 'lucide-react';
import Navigation from '../layout/Navigation';
import { useIsDesktop } from './docsHooks';
import '../../styles/elevate-docs.css';

const NAV_COLLAPSED_KEY = 'elevate.docs.navCollapsed';

const SECTION_TITLES = {
  blog: { label: 'Blog', to: '/all' },
  update: { label: '최신 정보', to: '/update' },
  program: { label: '프로그램 소식', to: '/program-news' },
  agenthon: { label: '에이전톤', to: '/agenthon' },
  activity: { label: 'Activity', to: '/activity' },
};

function readCollapsed() {
  try {
    return window.localStorage.getItem(NAV_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function persistCollapsed(value) {
  try {
    window.localStorage.setItem(NAV_COLLAPSED_KEY, value ? '1' : '0');
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this visit.
  }
}

function DocSearch({ placeholder, value = '', onSubmit }) {
  const [query, setQuery] = useState(value);

  return (
    <form
      role="search"
      className="edoc-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(query.trim());
      }}
    >
      <Search className="edoc-search__icon" size={15} aria-hidden="true" />
      <input
        type="search"
        className="edoc-search__input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
      />
      {query && (
        <button
          type="button"
          className="edoc-search__clear"
          aria-label="검색어 지우기"
          onClick={() => {
            setQuery('');
            if (value) onSubmit('');
          }}
        >
          <X size={12} strokeWidth={3} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}

function DocsFooter() {
  return (
    <footer className="edoc-footer">
      <div className="edoc-container edoc-container--wide edoc-footer__inner">
        <span>&copy; 2026 Microsoft Elevate Korea. All rights reserved.</span>
        <nav aria-label="약관">
          <a href="https://www.microsoft.com/ko-kr/privacy/privacystatement" target="_blank" rel="noopener noreferrer">
            개인정보처리방침
          </a>
          <a href="https://www.microsoft.com/ko-kr/servicesagreement" target="_blank" rel="noopener noreferrer">
            이용약관
          </a>
        </nav>
      </div>
    </footer>
  );
}

/**
 * @param {Object} props
 * @param {'blog'|'update'|'program'|'agenthon'|'activity'} [props.section]
 * @param {Object} [props.tintStyle] - getTintStyle() 결과 (카테고리 색 CSS 변수)
 * @param {React.ReactNode} props.navigator - 왼쪽 내비게이터 콘텐츠
 * @param {{ placeholder: string, value?: string, onSubmit: (q: string) => void }} [props.search]
 * @param {string} [props.fabLabel] - 모바일에서 내비게이터를 여는 플로팅 버튼 라벨
 */
export default function DocsShell({ section = 'blog', tintStyle, navigator, search, fabLabel, children }) {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [barStuck, setBarStuck] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const sentinelRef = useRef(null);

  const routeKey = `${location.pathname}${location.search}`;
  const [drawerRouteKey, setDrawerRouteKey] = useState(routeKey);
  if (drawerRouteKey !== routeKey) {
    setDrawerRouteKey(routeKey);
    setDrawerOpen(false);
  }

  // A new page starts at the top. `instant` overrides the global smooth scrolling.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // The header scrolls away with the page; once the doc bar reaches the top and sticks,
  // it switches to its translucent glass look (like Apple Developer's nav--is-sticking).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setBarStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Keep the sticky sidebar exactly as tall as the visible viewport below the doc bar,
  // so the filter field at its bottom stays on screen while the header scrolls away.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    let frame = 0;
    let last = '';
    const update = () => {
      frame = 0;
      const top = Math.max(0, nav.getBoundingClientRect().top);
      const value = `${Math.max(240, Math.round(window.innerHeight - top))}px`;
      if (value !== last) {
        last = value;
        nav.style.setProperty('--edoc-nav-h', value);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [collapsed, isDesktop]);

  // Mobile drawer: lock page scroll and move focus into the drawer.
  useEffect(() => {
    if (!drawerOpen || isDesktop) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    navRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = previous;
    };
  }, [drawerOpen, isDesktop]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      const input = navRef.current?.querySelector('[data-edoc-filter]');
      if (!input) return;
      event.preventDefault();
      if (window.matchMedia('(min-width: 1024px)').matches) {
        if (collapsed) {
          setCollapsed(false);
          persistCollapsed(false);
        }
      } else {
        setDrawerOpen(true);
      }
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen, collapsed]);

  const toggleNav = () => {
    if (isDesktop) {
      const next = !collapsed;
      setCollapsed(next);
      persistCollapsed(next);
    } else {
      setDrawerOpen((open) => !open);
    }
  };

  // Close the drawer after picking an item on mobile (TOC items don't change the route).
  const handleNavClick = (event) => {
    if (isDesktop) return;
    if (event.target instanceof Element && event.target.closest('.edoc-nav__link')) {
      setDrawerOpen(false);
    }
  };

  const title = SECTION_TITLES[section] || SECTION_TITLES.blog;
  const navVisible = isDesktop ? !collapsed : drawerOpen;

  return (
    <div className="edoc" style={tintStyle}>
      <a className="edoc-skip" href="#edoc-content">
        본문 바로가기
      </a>
      <Navigation fixed={false} />
      <div ref={sentinelRef} className="edoc-dbar-sentinel" aria-hidden="true" />

      <div className="edoc-dbar" data-stuck={barStuck ? 'true' : 'false'}>
        <div className="edoc-dbar__inner">
          <button
            ref={toggleRef}
            type="button"
            className="edoc-iconbtn"
            aria-controls="edoc-nav"
            aria-expanded={navVisible}
            aria-label={navVisible ? '사이드바 닫기' : '사이드바 열기'}
            title={navVisible ? '사이드바 닫기' : '사이드바 열기'}
            onClick={toggleNav}
          >
            <PanelLeft size={19} strokeWidth={1.7} aria-hidden="true" />
          </button>
          <Link to={title.to} className="edoc-dbar__title">
            {title.label}
          </Link>
          {search && <DocSearch key={search.value || ''} {...search} />}
        </div>
      </div>

      <div className="edoc-body">
        <aside
          id="edoc-nav"
          ref={navRef}
          className="edoc-nav"
          tabIndex={-1}
          aria-label="문서 탐색"
          data-open={drawerOpen ? 'true' : 'false'}
          data-collapsed={isDesktop && collapsed ? 'true' : 'false'}
          onClick={handleNavClick}
        >
          <button
            type="button"
            className="edoc-iconbtn edoc-nav__close"
            aria-label="사이드바 닫기"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={18} aria-hidden="true" />
          </button>
          {navigator}
        </aside>

        <main id="edoc-content" className="edoc-main">
          {children}
        </main>
      </div>
      <DocsFooter />

      {drawerOpen && !isDesktop && <div className="edoc-scrim" aria-hidden="true" onClick={() => setDrawerOpen(false)} />}
      {fabLabel && !drawerOpen && !isDesktop && (
        <button type="button" className="edoc-fab" onClick={() => setDrawerOpen(true)}>
          <ListTree size={17} aria-hidden="true" />
          {fabLabel}
        </button>
      )}
    </div>
  );
}
