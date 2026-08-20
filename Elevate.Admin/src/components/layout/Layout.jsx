import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

function Layout() {
  return (
    <div className="min-h-screen bg-ms-slate text-neutral-900 relative">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-8 md:px-12 md:py-12 max-w-[1400px] mx-auto w-full animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
