import { NavLink } from 'react-router-dom'
import { FileText, LayoutDashboard } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/posts', label: 'Posts', icon: FileText },
]

function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-black/5 bg-transparent px-4 py-8">
      <div className="mb-10 px-2 animate-fadeIn">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
          Admin
        </p>
        <h2 className="text-xl font-semibold text-neutral-900">Elevate</h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-black/5 text-neutral-900 font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-ms-blue before:rounded-r-md'
                  : 'text-neutral-600 hover:bg-black/5 hover:text-neutral-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
