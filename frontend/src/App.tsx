import React, { useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register'>('login')

  if (view === 'register') {
    return (
      <RegisterPage onNavigateToLogin={() => setView('login')} />
    )
  }

  return (
    <LoginPage onNavigateToRegister={() => setView('register')} />
  )
}

export default App
