import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between shrink-0">
      <span className="text-gray-600 font-medium">IT Asset Management System</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Welcome, <strong>{user?.name}</strong></span>
        <button onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
          Logout
        </button>
      </div>
    </header>
  )
}
