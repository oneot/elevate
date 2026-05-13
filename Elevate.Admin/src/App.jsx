import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/index.js'
import NotFound from './pages/NotFound.jsx'
import PostEditor from './pages/PostEditor.jsx'
import CategoryPosts from './pages/CategoryPosts.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/category/m365" replace />} />
        <Route path="/category/:categoryId" element={<CategoryPosts />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:postId" element={<PostEditor />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
