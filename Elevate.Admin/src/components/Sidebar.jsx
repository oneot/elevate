import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Bot, Users, Box, Table2, NotebookPen,
  Trophy, RefreshCw, GraduationCap, Newspaper,
} from 'lucide-react'
import { CATEGORIES } from '../lib/categories.js'

const iconMap = {
  m365: LayoutGrid,
  copilot: Bot,
  teams: Users,
  minecraft: Box,
  excel: Table2,
  onenote: NotebookPen,
  agenthon: Trophy,
  update: RefreshCw,
  mee: GraduationCap,
  'program-news': Newspaper,
}

const mainCategories = CATEGORIES.filter((c) => c.group === 'main')
const subCategories = CATEGORIES.filter((c) => c.group === 'sub')

const navGroups = [
  { title: 'Main Category', items: mainCategories },
  { title: 'Sub Category',  items: subCategories },
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
      <nav className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = iconMap[item.value] || LayoutGrid
                return (
                  <NavLink
                    key={item.value}
                    to={`/category/${item.value}`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-black/5 text-neutral-900 font-semibold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-ms-blue before:rounded-r-md'
                          : 'text-neutral-600 hover:bg-black/5 hover:text-neutral-900'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
