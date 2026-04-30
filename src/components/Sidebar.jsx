import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/assets', label: 'Assets', icon: '💻' },
  { to: '/personnel', label: 'Personnel', icon: '👥' },
  { to: '/assignments', label: 'Assignments', icon: '📋' },
  { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-lg font-bold leading-tight">IT Asset Management</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                isActive ? 'bg-blue-600 text-white font-medium' : 'text-blue-200 hover:bg-blue-800'
              }`
            }
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
