import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import PageBoundary from './PageBoundary.jsx'

function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-ms-slate text-neutral-900 relative">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-8 md:px-12 md:py-12 max-w-[1400px] mx-auto w-full animate-fadeIn">
          <PageBoundary key={pathname}>
            <Suspense fallback={<p role="status" className="py-12 text-center text-sm text-neutral-500">페이지를 불러오는 중...</p>}>
              <Outlet />
            </Suspense>
          </PageBoundary>
        </main>
      </div>
    </div>
  )
}

export default Layout
