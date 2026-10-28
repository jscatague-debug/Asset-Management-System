import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.data.token)
    setUser(res.data.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(u => ({ ...u, ...res.data.data }))
    return res.data
  }

  const uploadAvatar = async (file) => {
    const data = new FormData()
    data.append('avatar', file)
    const res = await api.post('/auth/avatar', data)
    setUser(u => ({ ...u, ...res.data.data }))
    return res.data
  }

  const removeAvatar = async () => {
    const res = await api.delete('/auth/avatar')
    setUser(u => ({ ...u, ...res.data.data }))
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, uploadAvatar, removeAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
