import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import NotFound from './pages/NotFound.jsx'
import PostEditor from './pages/PostEditor.jsx'
import PostsList from './pages/PostsList.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:postId" element={<PostEditor />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
