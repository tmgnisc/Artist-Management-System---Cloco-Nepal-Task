import React, { useEffect, useState } from 'react'
import { listUsers, deleteUser, createUser, type User } from '../services/userService'
import { useToast } from '../components/ToastProvider'

type SuperAdminDashboardProps = {
  onLogout: () => void
  currentUser: {
    id: number
    role: 'super_admin' | 'artist_manager' | 'artist'
  }
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onLogout,
  currentUser,
}) => {
  const [active, setActive] = useState<'home' | 'artists' | 'songs' | 'users'>('home')
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'artist' as 'super_admin' | 'artist_manager' | 'artist',
  })
  const { showToast } = useToast()

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      setUsersError(null)
      const response = await listUsers({ page: 1, limit: 10 })
      setUsers(response.users)
    } catch (err) {
      setUsersError('Failed to load users')
      showToast('Failed to load users', 'error')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (active === 'users') {
      fetchUsers()
    }
  }, [active])

  const navItemBase =
    'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors'

  return (
    <div className="min-h-screen bg-slate-950 text-brand-text flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950">
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-lg bg-brand-primary/20" />
            <div className="text-xs">
              <p className="font-semibold">Artist Studio</p>
              <p className="text-[10px] text-brand-text-muted">
                Super admin
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <button
            className={`${navItemBase} ${
              active === 'home'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('home')}
          >
            <span>Home</span>
          </button>
          <button
            className={`${navItemBase} ${
              active === 'artists'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('artists')}
          >
            <span>Artists</span>
          </button>
          <button
            className={`${navItemBase} ${
              active === 'songs'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('songs')}
          >
            <span>Songs</span>
          </button>
          <button
            className={`${navItemBase} ${
              active === 'users'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('users')}
          >
            <span>Users</span>
          </button>
        </nav>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-brand-text-muted">
          <p>Artist Management Studio</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 md:px-6 shadow-md shadow-black/40">
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
            <span className="text-xs text-brand-text-muted">
              Super admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-semibold tracking-tight">
              {active === 'home'
                ? 'Overview'
                : active === 'artists'
                ? 'Artists'
                : active === 'songs'
                ? 'Songs'
                : 'Users'}
            </h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-medium text-brand-text-muted hover:text-brand-text"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 bg-slate-950">
          <section className="max-w-6xl mx-auto space-y-4">
            {active === 'home' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs">
                    <p className="text-brand-text-muted">
                      Total artists
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs">
                    <p className="text-brand-text-muted">
                      Total songs
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs">
                    <p className="text-brand-text-muted">
                      Total users
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs md:text-sm">
                  <h2 className="text-sm md:text-base font-semibold">
                    Welcome
                  </h2>
                  <p className="mt-2 text-brand-text-muted">
                    Use the sidebar to navigate between artists, songs, and
                    users. This overview will later display key metrics and
                    recent activity for your catalog.
                  </p>
                </div>
              </>
            )}

            {active === 'artists' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs md:text-sm">
                <h2 className="text-sm md:text-base font-semibold">
                  Artists
                </h2>
                <p className="mt-2 text-brand-text-muted">
                  This section will show artist list, filters, and quick
                  actions. Integration with the artists API can be added
                  next.
                </p>
              </div>
            )}

            {active === 'songs' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs md:text-sm">
                <h2 className="text-sm md:text-base font-semibold">
                  Songs
                </h2>
                <p className="mt-2 text-brand-text-muted">
                  This section will show songs, genres, and related
                  artists. It will later connect to the songs API with
                  search and filters.
                </p>
              </div>
            )}

            {active === 'users' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-xs md:text-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm md:text-base font-semibold">
                    Users
                  </h2>
                  <button
                    type="button"
                    className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft"
                    onClick={() => {
                      setShowCreateUser(true)
                      setCreateError(null)
                    }}
                  >
                    + New user
                  </button>
                </div>

                {usersLoading ? (
                  <p className="text-brand-text-muted text-xs">
                    Loading users...
                  </p>
                ) : usersError ? (
                  <p className="text-red-300 text-xs">{usersError}</p>
                ) : users.length === 0 ? (
                  <p className="text-brand-text-muted text-xs">
                    No users found yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px] md:text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-brand-text-muted">
                          <th className="py-2 pr-4 font-medium">Name</th>
                          <th className="py-2 pr-4 font-medium">Email</th>
                          <th className="py-2 pr-4 font-medium">Role</th>
                          <th className="py-2 pr-4 font-medium hidden md:table-cell">
                            Phone
                          </th>
                          <th className="py-2 pr-2 font-medium text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-slate-800/60 last:border-0"
                          >
                            <td className="py-2 pr-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-brand-text">
                                  {user.first_name} {user.last_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-2 pr-4 text-brand-text-muted">
                              {user.email}
                            </td>
                            <td className="py-2 pr-4 text-brand-text-muted capitalize">
                              {user.role.replace('_', ' ')}
                            </td>
                            <td className="py-2 pr-4 text-brand-text-muted hidden md:table-cell">
                              {user.phone || '-'}
                            </td>
                            <td className="py-2 pr-2 text-right">
                              {user.role === 'super_admin' ||
                              user.id === currentUser.id ? (
                                <span className="text-[11px] text-brand-text-muted">
                                  Protected
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    className="mr-2 text-[11px] text-brand-text-muted hover:text-brand-text disabled:opacity-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="text-[11px] text-red-300 hover:text-red-200"
                                    onClick={async () => {
                                      try {
                                        await deleteUser(user.id)
                                        showToast('User deleted', 'success')
                                        fetchUsers()
                                      } catch {
                                        showToast(
                                          'Failed to delete user',
                                          'error',
                                        )
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Create user modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-xs shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-text">
                Create new user
              </h3>
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  setShowCreateUser(false)
                  setCreateError(null)
                }}
                disabled={createLoading}
              >
                Close
              </button>
            </div>
            {createError && (
              <p className="mb-2 text-[11px] text-red-300">
                {createError}
              </p>
            )}
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]"
              onSubmit={async (e) => {
                e.preventDefault()
                setCreateError(null)
                setCreateLoading(true)
                try {
                  await createUser({
                    first_name: createForm.first_name,
                    last_name: createForm.last_name,
                    email: createForm.email,
                    password: createForm.password,
                    gender: 'm',
                    role: createForm.role,
                  })
                  showToast('User created', 'success')
                  setShowCreateUser(false)
                  setCreateForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    role: 'artist',
                  })
                  fetchUsers()
                } catch (err: any) {
                  const message =
                    err?.data?.errors
                      ?.map((e: any) => e.message)
                      .join(' ') ||
                    err?.data?.message ||
                    'Failed to create user'
                  setCreateError(message)
                  showToast(message, 'error')
                } finally {
                  setCreateLoading(false)
                }
              }}
            >
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={createForm.first_name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="John"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={createForm.last_name}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Role
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: e.target
                        .value as 'super_admin' | 'artist_manager' | 'artist',
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="artist">Artist</option>
                  <option value="artist_manager">Artist manager</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="block text-brand-text-muted">
                  Temporary password
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Temp password"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                  onClick={() => {
                    setShowCreateUser(false)
                    setCreateError(null)
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft disabled:opacity-60"
                >
                  {createLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminDashboard

