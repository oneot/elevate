/**
 * @file App.jsx
 * @description SPA 최상위 라우팅 컴포넌트.
 *
 * React Router의 Routes/Route로 전체 페이지 라우팅을 정의하고,
 * 라우트 변경 시 Microsoft Clarity에 페이지뷰 이벤트를 전송한다.
 * 모든 페이지 컴포넌트는 lazy import로 코드 스플리팅 처리되어 있다.
 */
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { setClarityTag, trackClarityEvent } from './services/clarity';

const Home = lazy(() => import('./pages/Home'));
const PostList = lazy(() => import('./pages/PostList'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ActivityShowcasePage = lazy(() => import('./pages/ActivityShowcasePage'));
const Microsoft365Update = lazy(() => import('./pages/Microsoft365Update'));
const ProgramNews = lazy(() => import('./pages/ProgramNews'));

function App() {
  const location = useLocation();
  // 직전 라우트를 ref로 추적하여, pathname/search가 바뀌지 않은 경우
  // (예: hash만 변경) Clarity page_view가 중복 발생하는 것을 막는다.
  const previousRouteRef = useRef('');

  useEffect(() => {
    const routeKey = `${location.pathname}${location.search}`;

    if (previousRouteRef.current === routeKey) {
      return;
    }

    setClarityTag('route', routeKey);
    trackClarityEvent('page_view');
    previousRouteRef.current = routeKey;
  }, [location.pathname, location.search]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-ms-blue/20 border-t-ms-blue animate-spin" />
      </div>
    }>
      <Routes>
        <Route path="/update" element={<Microsoft365Update />} />
        <Route path="/program-news" element={<ProgramNews />} />
        <Route path="/agenthon" element={<PostDetail categoryProp="agenthon" useLatest={true} />} />
        <Route path="/activity" element={<ActivityShowcasePage />} />
        <Route path="/" element={<Home />} />
        <Route path="/:category" element={<PostList />} />
        <Route path="/:category/:postId" element={<PostDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
