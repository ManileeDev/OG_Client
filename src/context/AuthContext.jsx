import { createContext, useContext, useEffect, useState } from 'react'
import { apiGet, apiPost } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const nextUser = await apiPost('/auth/login', { username, password })
    localStorage.setItem('og-access-token', nextUser.accessToken)
    setUser(nextUser)
  }

  const logout = async () => {
    try {
      await apiPost('/auth/logout', {})
    } finally {
      localStorage.removeItem('og-access-token')
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}