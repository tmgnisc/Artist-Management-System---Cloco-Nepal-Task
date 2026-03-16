import React, { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ArtistManagerDashboard from './pages/ArtistManagerDashboard'
import type { LoginResponse } from './services/authService'

type View = 'login' | 'register' | 'dashboard'

type CurrentUser = LoginResponse['user'] | null

const App: React.FC = () => {
  const [view, setView] = useState<View>('login')
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const parsed: CurrentUser = JSON.parse(storedUser)
        setCurrentUser(parsed)
        setView('dashboard')
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setView('login')
  }

  if (view === 'register') {
    return (
      <RegisterPage onNavigateToLogin={() => setView('login')} />
    )
  }

  if (view === 'dashboard' && currentUser) {
    if (currentUser.role === 'super_admin') {
      return (
        <SuperAdminDashboard
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      )
    }

    if (currentUser.role === 'artist_manager') {
      return (
        <ArtistManagerDashboard
          onLogout={handleLogout}
          currentUser={{
            id: currentUser.id,
            role: 'artist_manager',
          }}
        />
      )
    }

    // Placeholder for artist role
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4 text-brand-text">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold">
            Dashboard coming soon
          </h1>
          <p className="text-sm text-brand-text-muted">
            Role-specific dashboards for artist managers and artists are not implemented yet.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-slate-950"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <LoginPage
      onNavigateToRegister={() => setView('register')}
      onLoginSuccess={(user) => {
        setCurrentUser(user)
        setView('dashboard')
      }}
    />
  )
}

export default App
