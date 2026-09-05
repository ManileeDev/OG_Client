import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null)
    }
    window.addEventListener('auth:session-expired', handleSessionExpired)

    const initAuth = async () => {
      try {
        const currentUser = await apiGet('/auth/me')
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  const login = async (username, password) => {
    const nextUser = await apiPost('/auth/login', { username, password })
    localStorage.setItem('og-access-token', nextUser.accessToken)
    localStorage.setItem('og-refresh-token', nextUser.refreshToken)
    setUser(nextUser)
  }

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {})
    } finally {
      localStorage.removeItem('og-access-token')
      localStorage.removeItem('og-refresh-token')
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}