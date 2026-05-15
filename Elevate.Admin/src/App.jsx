import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/index.js'
import NotFound from './pages/NotFound.jsx'
import PostEditor from './pages/PostEditor.jsx'
import CategoryPosts from './pages/CategoryPosts.jsx'

/**
 * 앱 라우팅 구조.
 *
 * - Layout 이 Outlet 을 통해 인증된 내부 페이지를 감싼다.
 * - 루트(/) 접근 시 기본 카테고리(m365)로 리디렉션한다.
 * - /posts/:postId — 기존 게시글 편집, /posts/new — 신규 게시글 작성
 * - 매칭되지 않는 경로는 NotFound 로 이동한다.
 */
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
