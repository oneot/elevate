import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';
import MEEPre from './pages/MEEPre';
import MEEExplorerProcedure from './pages/MEEExplorerProcedure';
import MIEEArchive from './pages/MIEEArchive';
import AgenthonInterview from "./pages/AgenthonInterview";
import { setClarityTag, trackClarityEvent } from './lib/clarity';
import ActivityShowcasePage from "./pages/ActivityShowcasePage";

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
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/blog" element={<Blog />} /> */}
      <Route path="/mee/pre" element={<MEEPre />} />
      <Route path="/mee/explorer-procedure" element={<MEEExplorerProcedure />} />
      <Route path="/mee/miee-archive" element={<MIEEArchive />} />
      <Route path="/:category" element={<PostList />} />
      <Route path="/:category/:postId" element={<PostDetail />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/agenthon" element={<AgenthonInterview />} />
      <Route path="/activity" element={<ActivityShowcasePage />} />
    </Routes>
  );
}

export default App;
