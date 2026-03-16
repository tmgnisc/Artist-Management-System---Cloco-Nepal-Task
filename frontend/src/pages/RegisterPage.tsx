import React, { useState } from 'react'
import { registerArtistManager } from '../services/authService'
import { ApiError } from '../lib/apiClient'
import { useToast } from '../components/ToastProvider'

type RegisterPageProps = {
  onNavigateToLogin?: () => void
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: 'm' as 'm' | 'f' | 'o',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      await registerArtistManager(form)
      const message = 'Account created successfully. You can now sign in.'
      setSuccess(message)
      showToast(message, 'success')
      if (onNavigateToLogin) {
        onNavigateToLogin()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldMessages =
          err.data?.errors?.map((e) => e.message).join(' ') || ''
        const fallbackMessage =
          err.data?.message || 'Registration failed'
        const message = fieldMessages || fallbackMessage
        setError(message)
        showToast(message, 'error')
      } else {
        const message = 'Unable to register. Please try again.'
        setError(message)
        showToast(message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-app-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-text">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-brand-text-muted">
            Register a new user to access the Artist Management Studio.
          </p>
        </div>

        <div className="bg-brand-surface backdrop-blur-xl border border-brand-border shadow-2xl shadow-black/60 rounded-2xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {success}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-brand-text"
                >
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                  placeholder="John"
                  value={form.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-brand-text"
                >
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-brand-text"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-brand-text"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 pr-10 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-brand-text-muted hover:text-brand-text"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-5 0-9-4-10-8 0-1.05.21-2.05.6-3" />
                          <path d="M3 3l18 18" />
                          <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
                          <path d="M9.88 4.12A9.77 9.77 0 0 1 12 4c5 0 9 4 10 8a10.52 10.52 0 0 1-1.43 3.36" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-brand-text-muted">
                  Must contain at least one uppercase letter, one lowercase letter, and one number.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-brand-text"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                  placeholder="+1 000 000 0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-brand-text"
                >
                  Date of birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60"
                  value={form.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-brand-text">
                  Gender
                </span>
                <div className="flex gap-4 text-sm text-brand-text">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="m"
                      checked={form.gender === 'm'}
                      onChange={handleChange}
                      className="h-3 w-3 rounded border-brand-border bg-slate-900 text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Male</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="f"
                      checked={form.gender === 'f'}
                      onChange={handleChange}
                      className="h-3 w-3 rounded border-brand-border bg-slate-900 text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Female</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      value="o"
                      checked={form.gender === 'o'}
                      onChange={handleChange}
                      className="h-3 w-3 rounded border-brand-border bg-slate-900 text-brand-primary focus:ring-brand-primary"
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-brand-text"
              >
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text placeholder:text-brand-text-muted shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60 resize-none"
                placeholder="Street, city, country"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-brand-text"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="artist_manager"
                disabled
                className="block w-full rounded-lg border border-brand-border bg-slate-900/60 px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/60 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="artist_manager">Artist manager</option>
              </select>
              <p className="text-xs text-brand-text-muted">
                Public registration is only available for artist managers. Super admin is created once by a seed script, and other users are managed from the admin panel.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-brand-primary/40 transition hover:bg-brand-primary-soft focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-brand-text-muted">
          <p>All fields marked as required must be filled to create a new account.</p>
          {onNavigateToLogin && (
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="mt-2 font-medium text-brand-accent hover:text-brand-primary"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterPage

