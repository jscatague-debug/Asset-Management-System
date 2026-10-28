import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'

// Line icons drawn in currentColor, so they follow the link's text color on the dark sidebar
const Icon = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <Icon><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Icon> },
  { to: '/assets', label: 'Assets', icon: <Icon><rect x="4" y="4" width="16" height="11" rx="2" /><path d="M2 20h20" /></Icon> },
  { to: '/personnel', label: 'Outlet', icon: <Icon><path d="M4 4h16l1 5H3l1-5z" /><path d="M5 9v11h14V9" /><path d="M10 20v-6h4v6" /></Icon> },
  { to: '/assignments', label: 'Assignments', icon: <Icon><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 13l2 2 4-4" /></Icon> },
  { to: '/maintenance', label: 'Maintenance', icon: <Icon><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></Icon> },
  { to: '/archive', label: 'Archive Log', icon: <Icon><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M10 13h4" /></Icon> },
]

export default function Sidebar({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop for the mobile drawer */}
      <div onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-200
        lg:static lg:w-64 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Innovative Hub logo" className="h-9 w-9 shrink-0 rounded-full bg-white ring-2 ring-white/20" />
            <div>
              <p className="font-semibold leading-tight">IT Asset</p>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu"
            className="lg:hidden h-9 w-9 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white text-xl">×</button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm origin-left transition duration-200 ease-out hover:scale-105 ${
                  isActive ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/40' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="w-5 flex justify-center transition-transform duration-200 group-hover:scale-125">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="px-6 py-4 border-t border-white/10 text-xs text-slate-500">
          ©2026 Innovative Hub. All rights reserved.
        </p>
      </aside>
    </>
  )
}
