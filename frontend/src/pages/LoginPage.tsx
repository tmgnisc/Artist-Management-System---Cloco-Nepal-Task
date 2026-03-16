import React, { useState } from 'react'
import { login } from '../services/authService'
import { ApiError } from '../lib/apiClient'

type LoginPageProps = {
  onNavigateToRegister?: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      // Later: navigate to dashboard
      console.log("login done")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.data?.message || 'Invalid email or password')
      } else {
        setError('Unable to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-text">
            Artist Management Studio
          </h1>
          <p className="mt-2 text-sm text-brand-text-muted">
            Sign in to manage users, artists, and songs.
          </p>
        </div>

        <div className="bg-brand-surface backdrop-blur-xl border border-brand-border shadow-2xl shadow-black/60 rounded-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-brand-text"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-brand-text"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-brand-accent hover:text-brand-primary"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-brand-text-muted">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
                <span>Secure admin access</span>
              </div>
              <span>v1.0.0</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-brand-primary/40 transition hover:bg-brand-primary-soft focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-brand-text-muted">
          <p>Use your assigned credentials to access the dashboard.</p>
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="mt-2 font-medium text-brand-accent hover:text-brand-primary"
          >
            Register now
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

