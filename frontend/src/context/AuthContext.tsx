/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { LoginResponse } from '../services/authService'

type User = LoginResponse['user']

type AuthContextValue = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (payload: {
    user: User
    accessToken: string
    refreshToken: string
  }) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    const storedAccess = localStorage.getItem('accessToken')
    if (storedUser && storedAccess) {
      try {
        setUser(JSON.parse(storedUser) as User)
        setAccessToken(storedAccess)
      } catch {
        setUser(null)
        setAccessToken(null)
      }
    }
  }, [])

  const login = (payload: {
    user: User
    accessToken: string
    refreshToken: string
  }) => {
    setUser(payload.user)
    setAccessToken(payload.accessToken)
    localStorage.setItem('currentUser', JSON.stringify(payload.user))
    localStorage.setItem('accessToken', payload.accessToken)
    localStorage.setItem('refreshToken', payload.refreshToken)
  }

  const logout = () => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      login,
      logout,
    }),
    [user, accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
