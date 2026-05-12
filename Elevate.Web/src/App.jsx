import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { setClarityTag, trackClarityEvent } from './services/clarity';

const Home = lazy(() => import('./pages/Home'));
const PostList = lazy(() => import('./pages/PostList'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MEEPre = lazy(() => import('./pages/MEEPre'));
const MEEExplorerProcedure = lazy(() => import('./pages/MEEExplorerProcedure'));
const MIEEArchive = lazy(() => import('./pages/MIEEArchive'));
const AgenthonInterview = lazy(() => import('./pages/AgenthonInterview'));
const ActivityShowcasePage = lazy(() => import('./pages/ActivityShowcasePage'));
const Microsoft365Update = lazy(() => import('./pages/Microsoft365Update'));
const ProgramNews = lazy(() => import('./pages/ProgramNews'));

function App() {
  const location = useLocation();
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
    <Suspense fallback={null}>
      <Routes>
        <Route path="/mee/pre" element={<MEEPre />} />
        <Route path="/mee/explorer-procedure" element={<MEEExplorerProcedure />} />
        <Route path="/mee/miee-archive" element={<MIEEArchive />} />
        <Route path="/update" element={<Microsoft365Update />} />
        <Route path="/program-news" element={<ProgramNews />} />
        <Route path="/agenthon" element={<AgenthonInterview />} />
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
