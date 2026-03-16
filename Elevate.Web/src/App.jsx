import { Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';
import MEEPre from './pages/MEEPre';
import MEEExplorerProcedure from './pages/MEEExplorerProcedure';
import MIEEArchive from './pages/MIEEArchive';

function App() {
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
    </Routes>
  );
}

export default App;
