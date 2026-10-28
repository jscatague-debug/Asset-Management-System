import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-blue-900 flex items-center justify-center px-4 pt-6 pb-16 overflow-hidden">
      {/* Watermark: the logo tiled at a small size (it is only 32px, so it stays crisp), inverted to white and faded */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-1/2 -rotate-12 invert opacity-[0.08]"
        style={{ backgroundImage: 'url(/favicon.png)', backgroundSize: '44px', backgroundRepeat: 'space' }} />

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💻</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900">IT Asset Management</h1>
          <p className="text-gray-500 text-base sm:text-lg mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-base">{error}</div>}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@itasset.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <div className="absolute bottom-0 inset-x-0 pb-[max(1rem,env(safe-area-inset-bottom))] px-4 flex justify-center">
        <p className="bg-blue-950/70 backdrop-blur-sm ring-1 ring-white/15 rounded-full px-5 py-2 text-center text-sm sm:text-base font-medium text-white shadow-lg">
          ©2026 Innovative Hub. All rights reserved.
        </p>
      </div>
    </div>
  )
}
