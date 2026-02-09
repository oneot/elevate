import { Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostList from './pages/PostList';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:category" element={<PostList />} />
      <Route path="/blog/:category/:postId" element={<PostDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
