import React, { useEffect, useState } from 'react'
import {
  listUsers,
  deleteUser,
  createUser,
  updateUser,
  type User,
} from '../services/userService'
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
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'artist' as 'super_admin' | 'artist_manager' | 'artist',
  })
  const [showEditUser, setShowEditUser] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    id: number | null
    first_name: string
    last_name: string
    email: string
    phone?: string | null
    role: 'super_admin' | 'artist_manager' | 'artist'
  }>({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'artist',
  })
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  const fetchUsers = async (page = 1) => {
    try {
      setUsersLoading(true)
      setUsersError(null)
      const response = await listUsers({ page, limit: 5 })
      setUsers(response.users)
      setUsersPage(response.pagination.currentPage)
      setUsersTotalPages(response.pagination.totalPages)
    } catch (err) {
      setUsersError('Failed to load users')
      showToast('Failed to load users', 'error')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (active === 'users') {
      fetchUsers(usersPage)
    }
  }, [active, usersPage])

  const navItemBase =
    'w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors'

  return (
    <div className="min-h-screen bg-slate-950 text-brand-text flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-56 flex-col border-r border-slate-800 bg-slate-950">
        <div className="h-14 flex items-center justify-between px-4 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-lg bg-brand-primary/20" />
            <div className="text-[11px]">
              <p className="font-semibold">Artist Studio</p>
              <p className="text-[10px] text-brand-text-muted">
                Super admin
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
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
        <div className="px-4 py-3 border-t border-slate-800 text-[11px] text-brand-text-muted">
          <p>Artist Management Studio</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 md:px-5 shadow-md shadow-black/40">
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-primary" />
            <span className="text-xs text-brand-text-muted">
              Super admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight">
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
        <main className="flex-1 px-4 md:px-6 py-4 md:py-5 bg-slate-950">
          <section className="max-w-5xl mx-auto space-y-3">
            {active === 'home' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[11px]">
                    <p className="text-brand-text-muted">
                      Total artists
                    </p>
                    <p className="mt-1 text-xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[11px]">
                    <p className="text-brand-text-muted">
                      Total songs
                    </p>
                    <p className="mt-1 text-xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[11px]">
                    <p className="text-brand-text-muted">
                      Total users
                    </p>
                    <p className="mt-1 text-xl font-semibold">0</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                  <h2 className="text-sm font-semibold">
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
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                <h2 className="text-sm font-semibold">
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
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                <h2 className="text-sm font-semibold">
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
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">
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
                  <p className="text-brand-text-muted text-[11px]">
                    Loading users...
                  </p>
                ) : usersError ? (
                  <p className="text-red-300 text-[11px]">{usersError}</p>
                ) : users.length === 0 ? (
                  <p className="text-brand-text-muted text-[11px]">
                    No users found yet.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-[11px]">
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
                                      className="mr-2 text-[11px] text-brand-text-muted hover:text-brand-text"
                                      onClick={() => {
                                        setEditForm({
                                          id: user.id,
                                          first_name: user.first_name,
                                          last_name: user.last_name,
                                          email: user.email,
                                          phone: user.phone || '',
                                          role: user.role,
                                        })
                                        setEditError(null)
                                        setShowEditUser(true)
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className="text-[11px] text-red-300 hover:text-red-200"
                                      onClick={() => {
                                        setDeleteTarget(user)
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
                    {usersTotalPages > 1 && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-brand-text-muted">
                        <span>
                          Page {usersPage} of {usersTotalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={usersPage <= 1 || usersLoading}
                            onClick={() =>
                              !usersLoading &&
                              usersPage > 1 &&
                              setUsersPage(usersPage - 1)
                            }
                            className="rounded border border-slate-800 px-2 py-1 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={
                              usersPage >= usersTotalPages || usersLoading
                            }
                            onClick={() =>
                              !usersLoading &&
                              usersPage < usersTotalPages &&
                              setUsersPage(usersPage + 1)
                            }
                            className="rounded border border-slate-800 px-2 py-1 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Create user modal */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-[11px] shadow-2xl shadow-black/60">
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
              className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]"
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
                    phone: createForm.phone || undefined,
                    gender: 'm',
                    role: createForm.role,
                  })
                  showToast('User created', 'success')
                  setShowCreateUser(false)
                  setCreateForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Phone
                </label>
                <input
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="+1 000 000 0000"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
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
      {/* Edit user modal */}
      {showEditUser && editForm.id !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-xs shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-text">
                Edit user
              </h3>
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  setShowEditUser(false)
                  setEditError(null)
                }}
                disabled={editLoading}
              >
                Close
              </button>
            </div>
            {editError && (
              <p className="mb-2 text-[11px] text-red-300">
                {editError}
              </p>
            )}
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]"
              onSubmit={async (e) => {
                e.preventDefault()
                if (editForm.id == null) return
                setEditError(null)
                setEditLoading(true)
                try {
                  await updateUser(editForm.id, {
                    first_name: editForm.first_name,
                    last_name: editForm.last_name,
                    email: editForm.email,
                    phone: editForm.phone,
                    role: editForm.role,
                  } as any)
                  showToast('User updated successfully', 'success')
                  setShowEditUser(false)
                  fetchUsers()
                } catch (err: any) {
                  const message =
                    err?.data?.errors
                      ?.map((e: any) => e.message)
                      .join(' ') ||
                    err?.data?.message ||
                    'Failed to update user'
                  setEditError(message)
                  showToast(message, 'error')
                } finally {
                  setEditLoading(false)
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
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((prev) => ({
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
              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                  onClick={() => {
                    setShowEditUser(false)
                    setEditError(null)
                  }}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft disabled:opacity-60"
                >
                  {editLoading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-xs shadow-2xl shadow-black/60">
            <h3 className="text-sm font-semibold text-brand-text mb-2">
              Delete user
            </h3>
            <p className="text-brand-text-muted mb-3">
              Are you sure you want to delete{' '}
              <span className="font-medium text-brand-text">
                {deleteTarget.email}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  if (deleteLoading) return
                  setDeleteTarget(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-red-400 disabled:opacity-60"
                onClick={async () => {
                  if (!deleteTarget) return
                  setDeleteLoading(true)
                  try {
                    await deleteUser(deleteTarget.id)
                    showToast('User deleted successfully', 'success')
                    setDeleteTarget(null)
                    fetchUsers()
                  } catch {
                    showToast(
                      'Failed to delete user. Please try again.',
                      'error',
                    )
                  } finally {
                    setDeleteLoading(false)
                  }
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperAdminDashboard

