import React from 'react'
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import ArtistManagerDashboard from './pages/ArtistManagerDashboard'
import type { LoginResponse } from './services/authService'
import { useAuth } from './context/AuthContext'

const AppRoutes: React.FC = () => {
  const { user: currentUser, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleLoginSuccess = (user: LoginResponse['user']) => {
    // tokens are already stored via AuthContext.login triggered from login page
    if (user.role === 'super_admin') {
      navigate('/dashboard/super-admin', { replace: true })
    } else if (user.role === 'artist_manager') {
      navigate('/dashboard/artist-manager', { replace: true })
    } else {
      navigate('/dashboard/artist', { replace: true })
    }
  }

  const ProtectedRoute: React.FC<{
    children: React.ReactElement
    allowedRoles?: Array<'super_admin' | 'artist_manager' | 'artist'>
  }> = ({ children, allowedRoles }) => {
    if (!isAuthenticated || !currentUser) {
      return (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      )
    }
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/login" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onNavigateToRegister={() => navigate('/register')}
            onLoginSuccess={handleLoginSuccess}
          />
        }
      />
      <Route
        path="/register"
        element={<RegisterPage onNavigateToLogin={() => navigate('/login')} />}
      />
      <Route
        path="/dashboard/super-admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard
              onLogout={handleLogout}
              currentUser={currentUser!}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/artist-manager"
        element={
          <ProtectedRoute allowedRoles={['artist_manager']}>
            <ArtistManagerDashboard
              onLogout={handleLogout}
              currentUser={{
                id: currentUser?.id || 0,
                role: 'artist_manager',
              }}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/artist"
        element={
          <ProtectedRoute allowedRoles={['artist']}>
            <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4 text-brand-text">
              <div className="text-center space-y-3">
                <h1 className="text-2xl font-semibold">
                  Artist dashboard coming soon
                </h1>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-slate-950"
                >
                  Logout
                </button>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated && currentUser ? (
            <Navigate
              to={
                currentUser.role === 'super_admin'
                  ? '/dashboard/super-admin'
                  : currentUser.role === 'artist_manager'
                    ? '/dashboard/artist-manager'
                    : '/dashboard/artist'
              }
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return <AppRoutes />
}

export default App
