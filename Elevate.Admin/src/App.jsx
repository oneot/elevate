import { lazy } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { Layout } from './components/layout/index.js'
import NotFound from './pages/NotFound.jsx'

const AppPosts = lazy(() => import('./pages/AppPosts.jsx'))
const PostEditor = lazy(() => import('./pages/PostEditor.jsx'))

/** 이전 주소(/category/:categoryId)를 앱 목록으로 옮긴다. 앱이 아니면 목록 화면이 NotFound를 보여 준다. */
function LegacyCategoryRedirect() {
  const { categoryId } = useParams()
  return <Navigate to={`/apps/${encodeURIComponent(categoryId)}`} replace />
}

/**
 * 앱 라우팅 구조. 관리자는 앱별 게시글 작성·편집만 제공한다.
 *
 * - Layout이 로그인 확인, 게시글 목록 상태, 쉘(헤더·문서 바·앱 내비게이터)을 담당한다.
 * - /apps/all — 전체 게시글, /apps/:appKey — 앱별 게시글 (공개 사이트의 13개 앱)
 * - /posts/new?app=:appKey — 새 게시글, /posts/:postId — 기존 게시글 편집
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/apps/all" replace />} />
        <Route path="/apps/:appKey" element={<AppPosts />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:postId" element={<PostEditor />} />
        <Route path="/category/:categoryId" element={<LegacyCategoryRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
