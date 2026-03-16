import React from 'react'

type LoginPageProps = {
  onNavigateToRegister?: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
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
          <form className="space-y-6">
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
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-brand-primary/40 transition hover:bg-brand-primary-soft focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Sign in
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

