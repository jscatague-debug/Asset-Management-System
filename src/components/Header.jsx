import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProfileModal from './ProfileModal'
import Avatar from './Avatar'

export default function Header({ onMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="bg-white/80 backdrop-blur border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenu} aria-label="Open menu"
          className="lg:hidden h-10 w-10 -ml-2 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/favicon.png" alt="Innovative Hub logo" className="h-8 w-8 shrink-0 rounded-full" />
        <span className="text-slate-700 font-medium truncate">
          <span className="sm:hidden">IT Asset Management</span>
          <span className="hidden sm:inline">IT Asset Management System</span>
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button onClick={() => setShowProfile(true)} title="Edit profile"
          className="flex items-center gap-2 rounded-full md:pr-3 hover:bg-slate-100 transition">
          <Avatar user={user} />
          <span className="hidden md:block text-sm text-slate-600 font-medium">{user?.name}</span>
        </button>
        <button onClick={handleLogout}
          className="text-sm bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition">
          Logout
        </button>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </header>
  )
}
