import { NavLink } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'

const NAV = [
  {
    label: 'Command Center',
    to: '/',
    end: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'All Projects',
    to: '/projects',
    end: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Import Projects',
    to: '/import',
    end: false,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const { openQuickAdd } = useApp()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-1 border-r border-white/5 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">Project Vault</p>
            <p className="text-xs text-slate-500 mt-0.5">Personal OS</p>
          </div>
        </div>
      </div>

      {/* Quick Add CTA */}
      <div className="px-3 pt-3">
        <button
          onClick={openQuickAdd}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent-hover hover:bg-accent/20 border border-accent/20 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Quick Add
          </span>
          <span className="text-[10px] text-accent/50 font-mono">⌘⇧N</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent-hover font-medium'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-2'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div className="pt-2 border-t border-white/5 mt-2">
          <NavLink
            to="/projects/new"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/15 text-accent-hover font-medium'
                  : 'text-slate-500 hover:text-slate-100 hover:bg-surface-2'
              }`
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Full Form
          </NavLink>
        </div>
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-xs text-slate-600 truncate">anthonymeszaros93</p>
      </div>
    </aside>
  )
}
