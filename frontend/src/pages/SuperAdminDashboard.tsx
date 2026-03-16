import React, { useState } from 'react'

type SuperAdminDashboardProps = {
  onLogout: () => void
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onLogout,
}) => {
  const [active, setActive] = useState<'home' | 'artists' | 'songs' | 'users'>('home')

  const navItemBase =
    'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors'

  return (
    <div className="min-h-screen bg-app-gradient text-brand-text flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-brand-border bg-slate-950/90">
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
        <div className="px-4 py-3 border-t border-brand-border text-xs text-brand-text-muted">
          <p>Artist Management Studio</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between border-b border-brand-border bg-slate-950/70 px-4 md:px-6">
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
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <section className="max-w-5xl mx-auto space-y-4">
            {active === 'home' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-xs">
                    <p className="text-brand-text-muted">
                      Total artists
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-xs">
                    <p className="text-brand-text-muted">
                      Total songs
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                  <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-xs">
                    <p className="text-brand-text-muted">
                      Total users
                    </p>
                    <p className="mt-1 text-2xl font-semibold">0</p>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-4 text-xs md:text-sm">
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
              <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-4 text-xs md:text-sm">
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
              <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-4 text-xs md:text-sm">
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
              <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-4 text-xs md:text-sm">
                <h2 className="text-sm md:text-base font-semibold">
                  Users
                </h2>
                <p className="mt-2 text-brand-text-muted">
                  This section will show user management tools for
                  creating, updating, and deactivating users.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default SuperAdminDashboard

