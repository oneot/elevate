import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import NotFound from './pages/NotFound.jsx'
import PostEditor from './pages/PostEditor.jsx'
import PostsList from './pages/PostsList.jsx'
import AgenthonPosts from './pages/AgenthonPosts.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:postId" element={<PostEditor />} />
        <Route path="/agenthon" element={<AgenthonPosts />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
