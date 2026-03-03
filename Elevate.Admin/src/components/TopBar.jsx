import { Link } from 'react-router-dom'

function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-between px-6 py-4">
        <div className="animate-fadeIn flex items-center gap-4">
          <h1 className="text-lg font-semibold text-neutral-900">Content Studio</h1>
        </div>
        <div className="flex items-center gap-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <span className="rounded-md bg-ms-green/10 px-3 py-1 text-xs font-medium text-ms-green border border-ms-green/20">
            Entra ID Auth
          </span>
          <Link
            to="/posts/new"
            className="rounded-md bg-ms-blue px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#005a9e] shadow-elevation-2 hover:shadow-elevation-4"
          >
            New Post
          </Link>
        </div>
      </div>
    </header>
  )
}

export default TopBar
