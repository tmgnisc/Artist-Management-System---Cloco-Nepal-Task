import React, { useEffect, useState } from 'react'
import {
  listArtists,
  createArtist,
  updateArtist,
  deleteArtist,
  importArtistsCsv,
  exportArtistsCsv,
  type Artist,
} from '../services/artistService'
import {
  listSongsForArtist,
  listAllSongs,
  createSongForArtist,
  updateSong as updateSongApi,
  deleteSong as deleteSongApi,
  type Song,
} from '../services/songService'
import { useToast } from '../components/ToastProvider'

type ArtistManagerDashboardProps = {
  onLogout: () => void
  currentUser: {
    id: number
    role: 'artist_manager'
  }
}

const ArtistManagerDashboard: React.FC<ArtistManagerDashboardProps> = ({
  onLogout,
}) => {
  const { showToast } = useToast()
  const [active, setActive] = useState<'artists' | 'songs'>('artists')

  const [artists, setArtists] = useState<Artist[]>([])
  const [artistsPage, setArtistsPage] = useState(1)
  const [artistsTotalPages, setArtistsTotalPages] = useState(1)
  const [artistsLoading, setArtistsLoading] = useState(false)
  const [artistsError, setArtistsError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

  const [showArtistModal, setShowArtistModal] = useState(false)
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null)
  const [artistForm, setArtistForm] = useState({
    name: '',
    dob: '',
    gender: '' as '' | 'm' | 'f' | 'o',
    address: '',
    first_release_year: '',
    no_of_albums_released: '',
  })
  const [artistSaving, setArtistSaving] = useState(false)

  const [csvLoading, setCsvLoading] = useState(false)

  const [songs, setSongs] = useState<Song[]>([])
  const [songsPage, setSongsPage] = useState(1)
  const [songsTotalPages, setSongsTotalPages] = useState(1)
  const [songsLoading, setSongsLoading] = useState(false)
  const [songsFilterArtistId, setSongsFilterArtistId] = useState<number | 'all'>(
    'all',
  )
  const [songModalOpen, setSongModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [songForm, setSongForm] = useState({
    artistId: 0,
    title: '',
    album_name: '',
    genre: '' as '' | 'rnb' | 'country' | 'classic' | 'rock' | 'jazz',
  })
  const [songSaving, setSongSaving] = useState(false)
  const [songDeleteTarget, setSongDeleteTarget] = useState<Song | null>(null)
  const [songDeleteLoading, setSongDeleteLoading] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const navItemBase =
    'w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors'

  const loadArtists = async (page = 1, term = search) => {
    try {
      setArtistsLoading(true)
      setArtistsError(null)
      const res = await listArtists({ page, limit: 5, search: term || undefined })
      setArtists(res.artists)
      setArtistsPage(res.pagination.currentPage)
      setArtistsTotalPages(res.pagination.totalPages)
    } catch (err: any) {
      setArtistsError('Failed to load artists')
      showToast('Failed to load artists', 'error')
    } finally {
      setArtistsLoading(false)
    }
  }

  const loadSongsForArtistView = async (artist: Artist, page = 1) => {
    try {
      setSongsLoading(true)
      const res = await listSongsForArtist(artist.id, page, 5)
      setSongs(res.songs)
      setSongsPage(res.pagination.currentPage)
      setSongsTotalPages(res.pagination.totalPages)
    } catch {
      showToast('Failed to load songs', 'error')
    } finally {
      setSongsLoading(false)
    }
  }

  const loadSongs = async (page = 1, artistId?: number | null) => {
    try {
      setSongsLoading(true)
      const res = await listAllSongs({
        page,
        limit: 5,
        artistId: artistId || undefined,
      })
      setSongs(res.songs)
      setSongsPage(res.pagination.currentPage)
      setSongsTotalPages(res.pagination.totalPages)
    } catch {
      showToast('Failed to load songs', 'error')
    } finally {
      setSongsLoading(false)
    }
  }

  useEffect(() => {
    loadArtists(artistsPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (active === 'songs') {
      const artistId =
        songsFilterArtistId === 'all' ? undefined : songsFilterArtistId
      loadSongs(songsPage, artistId ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, songsPage, songsFilterArtistId])

  const openCreateArtist = () => {
    setEditingArtist(null)
    setArtistForm({
      name: '',
      dob: '',
      gender: '',
      address: '',
      first_release_year: '',
      no_of_albums_released: '',
    })
    setShowArtistModal(true)
  }

  const openEditArtist = (artist: Artist) => {
    setEditingArtist(artist)
    setArtistForm({
      name: artist.name,
      dob: artist.dob || '',
      gender: (artist.gender || '') as '' | 'm' | 'f' | 'o',
      address: artist.address || '',
      first_release_year: artist.first_release_year
        ? String(artist.first_release_year)
        : '',
      no_of_albums_released: artist.no_of_albums_released
        ? String(artist.no_of_albums_released)
        : '',
    })
    setShowArtistModal(true)
  }

  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artistForm.name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    setArtistSaving(true)
    try {
      const payload = {
        name: artistForm.name.trim(),
        dob: artistForm.dob || undefined,
        gender: artistForm.gender || undefined,
        address: artistForm.address || undefined,
        first_release_year: artistForm.first_release_year
          ? Number(artistForm.first_release_year)
          : undefined,
        no_of_albums_released: artistForm.no_of_albums_released
          ? Number(artistForm.no_of_albums_released)
          : undefined,
      }
      if (editingArtist) {
        await updateArtist(editingArtist.id, payload)
        showToast('Artist updated', 'success')
      } else {
        await createArtist(payload)
        showToast('Artist created', 'success')
      }
      setShowArtistModal(false)
      loadArtists(artistsPage)
    } catch (err: any) {
      const msg =
        err?.data?.errors?.map((e: any) => e.message).join(' ') ||
        err?.data?.message ||
        'Failed to save artist'
      showToast(msg, 'error')
    } finally {
      setArtistSaving(false)
    }
  }

  const handleDeleteArtist = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteArtist(deleteTarget.id)
      showToast('Artist deleted', 'success')
      setDeleteTarget(null)
      loadArtists(artistsPage)
    } catch {
      showToast('Failed to delete artist', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    try {
      await importArtistsCsv(file)
      showToast('Artists imported', 'success')
      loadArtists(1)
    } catch {
      showToast('Failed to import CSV', 'error')
    } finally {
      setCsvLoading(false)
      e.target.value = ''
    }
  }

  const handleExportCsv = async () => {
    setCsvLoading(true)
    try {
      const blob = await exportArtistsCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'artists.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast('Failed to export CSV', 'error')
    } finally {
      setCsvLoading(false)
    }
  }

  const openCreateSong = () => {
    const fallbackArtistId =
      selectedArtist?.id || (artists.length > 0 ? artists[0].id : 0)
    if (!fallbackArtistId) {
      showToast('Please create an artist first', 'error')
      return
    }
    setEditingSong(null)
    setSongForm({
      artistId: fallbackArtistId,
      title: '',
      album_name: '',
      genre: '',
    })
    setSongModalOpen(true)
  }

  const openEditSong = (song: Song) => {
    setEditingSong(song)
    setSongForm({
      artistId: song.artist_id,
      title: song.title,
      album_name: song.album_name || '',
      genre: song.genre,
    })
    setSongModalOpen(true)
  }

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault()
    const artistId = songForm.artistId
    if (!artistId) {
      showToast('Artist is required', 'error')
      return
    }
    if (!songForm.title.trim()) {
      showToast('Song title is required', 'error')
      return
    }
    if (!songForm.genre) {
      showToast('Genre is required', 'error')
      return
    }
    setSongSaving(true)
    try {
      const payload = {
        title: songForm.title.trim(),
        album_name: songForm.album_name || undefined,
        genre: songForm.genre,
      }
      if (editingSong) {
        await updateSongApi(editingSong.id, payload)
        showToast('Song updated', 'success')
      } else {
        await createSongForArtist(artistId, payload)
        showToast('Song created', 'success')
      }
      setSongModalOpen(false)
      const artist =
        artists.find((a) => a.id === artistId) || selectedArtist || null
      if (artist) {
        setSelectedArtist(artist)
        setSongsFilterArtistId(artist.id)
      } else {
        setSongsFilterArtistId('all')
      }
      setActive('songs')
      setSongsPage(1)
    } catch (err: any) {
      const msg =
        err?.data?.errors?.map((e: any) => e.message).join(' ') ||
        err?.data?.message ||
        'Failed to save song'
      showToast(msg, 'error')
    } finally {
      setSongSaving(false)
    }
  }

  const handleDeleteSong = async () => {
    if (!songDeleteTarget) return
    setSongDeleteLoading(true)
    try {
      await deleteSongApi(songDeleteTarget.id)
      showToast('Song deleted', 'success')
      setSongDeleteTarget(null)
      if (selectedArtist) {
        loadSongs(selectedArtist, songsPage)
      }
    } catch {
      showToast('Failed to delete song', 'error')
    } finally {
      setSongDeleteLoading(false)
    }
  }

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
                Artist manager
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          <button
            className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              active === 'artists'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('artists')}
          >
            <span>Artists</span>
          </button>
          <button
            className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              active === 'songs'
                ? 'bg-brand-primary/10 text-brand-text'
                : 'text-brand-text-muted hover:bg-slate-900/80'
            }`}
            onClick={() => setActive('songs')}
          >
            <span>Songs</span>
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 md:px-5 shadow-md shadow-black/40">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight">
              {active === 'artists'
                ? 'Artists'
                : selectedArtist
                ? `Songs · ${selectedArtist.name}`
                : 'Songs'}
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

        <main className="flex-1 px-4 md:px-6 py-4 md:py-5 bg-slate-950">
          <section className="max-w-5xl mx-auto space-y-3">
            {active === 'artists' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-semibold">Artists</h2>
                    <p className="text-[11px] text-brand-text-muted">
                      Manage artist records, CSV import/export, and open their songs.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadArtists(1, e.currentTarget.value)
                        }
                      }}
                      placeholder="Search by name"
                      className="h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-[11px] text-brand-text placeholder:text-brand-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => loadArtists(1, search)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px]"
                    >
                      Search
                    </button>
                    <label className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] cursor-pointer">
                      <span>{csvLoading ? 'Importing...' : 'Import CSV'}</span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportCsv}
                        disabled={csvLoading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      disabled={csvLoading}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-[11px]"
                    >
                      {csvLoading ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button
                      type="button"
                      onClick={openCreateArtist}
                      className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft"
                    >
                      + New artist
                    </button>
                  </div>
                </div>

                {artistsLoading ? (
                  <p className="text-[11px] text-brand-text-muted">
                    Loading artists...
                  </p>
                ) : artistsError ? (
                  <p className="text-[11px] text-red-300">{artistsError}</p>
                ) : artists.length === 0 ? (
                  <p className="text-[11px] text-brand-text-muted">
                    No artists yet.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-left text-brand-text-muted">
                            <th className="py-2 pr-4 font-medium">Name</th>
                            <th className="py-2 pr-4 font-medium hidden md:table-cell">
                              First release year
                            </th>
                            <th className="py-2 pr-4 font-medium hidden md:table-cell">
                              Albums
                            </th>
                            <th className="py-2 pr-2 font-medium text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {artists.map((artist) => (
                            <tr
                              key={artist.id}
                              className="border-b border-slate-800/60 last:border-0"
                            >
                              <td className="py-2 pr-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-brand-text">
                                    {artist.name}
                                  </span>
                                  <span className="text-[11px] text-brand-text-muted">
                                    {artist.address || '-'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 pr-4 text-brand-text-muted hidden md:table-cell">
                                {artist.first_release_year || '-'}
                              </td>
                              <td className="py-2 pr-4 text-brand-text-muted hidden md:table-cell">
                                {artist.no_of_albums_released ?? '-'}
                              </td>
                              <td className="py-2 pr-2 text-right space-x-2">
                                <button
                                  type="button"
                                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                                  onClick={() => {
                                    setSelectedArtist(artist)
                                    setActive('songs')
                                    setSongsPage(1)
                                    setSongsFilterArtistId(artist.id)
                                  }}
                                >
                                  Songs
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                                  onClick={() => openEditArtist(artist)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] text-red-300 hover:text-red-200"
                                  onClick={() => setDeleteTarget(artist)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {artistsTotalPages > 1 && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-brand-text-muted">
                        <span>
                          Page {artistsPage} of {artistsTotalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={artistsPage <= 1 || artistsLoading}
                            onClick={() =>
                              !artistsLoading &&
                              artistsPage > 1 &&
                              loadArtists(artistsPage - 1)
                            }
                            className="rounded border border-slate-800 px-2 py-1 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={
                              artistsPage >= artistsTotalPages ||
                              artistsLoading
                            }
                            onClick={() =>
                              !artistsLoading &&
                              artistsPage < artistsTotalPages &&
                              loadArtists(artistsPage + 1)
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

            {active === 'songs' && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-3 text-[12px]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Songs
                    </h2>
                    <p className="text-[11px] text-brand-text-muted">
                      Listing of all songs. Use the artist filter to narrow down the list.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={
                        songsFilterArtistId === 'all'
                          ? ''
                          : String(songsFilterArtistId)
                      }
                      onChange={(e) => {
                        const value = e.target.value
                        if (!value) {
                          setSongsFilterArtistId('all')
                          setSelectedArtist(null)
                          setSongsPage(1)
                        } else {
                          const id = Number(value)
                          setSongsFilterArtistId(id)
                          const artist = artists.find((a) => a.id === id) || null
                          setSelectedArtist(artist)
                          setSongsPage(1)
                        }
                      }}
                      className="h-8 rounded-lg border border-slate-800 bg-slate-950 px-2 text-[11px] text-brand-text placeholder:text-brand-text-muted"
                    >
                      <option value="">All artists</option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={openCreateSong}
                      className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft disabled:opacity-60"
                    >
                      + New song
                    </button>
                  </div>
                </div>

                {songsLoading ? (
                  <p className="text-[11px] text-brand-text-muted">
                    Loading songs...
                  </p>
                ) : songs.length === 0 ? (
                  <p className="text-[11px] text-brand-text-muted">
                    No songs for this artist yet.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-800 text-left text-brand-text-muted">
                            <th className="py-2 pr-4 font-medium">Title</th>
                            <th className="py-2 pr-4 font-medium hidden md:table-cell">
                              Album
                            </th>
                            <th className="py-2 pr-4 font-medium">Genre</th>
                            <th className="py-2 pr-2 font-medium text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {songs.map((song) => (
                            <tr
                              key={song.id}
                              className="border-b border-slate-800/60 last:border-0"
                            >
                              <td className="py-2 pr-4 text-brand-text">
                                {song.title}
                              </td>
                              <td className="py-2 pr-4 text-brand-text-muted hidden md:table-cell">
                                {song.album_name || '-'}
                              </td>
                              <td className="py-2 pr-4 text-brand-text-muted capitalize">
                                {song.genre}
                              </td>
                              <td className="py-2 pr-2 text-right space-x-2">
                                <button
                                  type="button"
                                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                                  onClick={() => openEditSong(song)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="text-[11px] text-red-300 hover:text-red-200"
                                  onClick={() => setSongDeleteTarget(song)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {songsTotalPages > 1 && (
                      <div className="mt-3 flex items-center justify-between text-[11px] text-brand-text-muted">
                        <span>
                          Page {songsPage} of {songsTotalPages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={songsPage <= 1 || songsLoading}
                            onClick={() =>
                              !songsLoading &&
                              songsPage > 1 &&
                              loadSongs(selectedArtist as Artist, songsPage - 1)
                            }
                            className="rounded border border-slate-800 px-2 py-1 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={
                              songsPage >= songsTotalPages || songsLoading
                            }
                            onClick={() =>
                              !songsLoading &&
                              songsPage < songsTotalPages &&
                              loadSongs(selectedArtist as Artist, songsPage + 1)
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
      {/* Create / Edit artist modal */}
      {showArtistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-[11px] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-text">
                {editingArtist ? 'Edit artist' : 'Create new artist'}
              </h3>
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  if (artistSaving) return
                  setShowArtistModal(false)
                }}
              >
                Close
              </button>
            </div>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
              onSubmit={handleSaveArtist}
            >
              <div className="space-y-1 md:col-span-2">
                <label className="block text-brand-text-muted">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={artistForm.name}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Artist name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={artistForm.dob}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      dob: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Gender
                </label>
                <select
                  value={artistForm.gender}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      gender: e.target.value as '' | 'm' | 'f' | 'o',
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="">Not specified</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                  <option value="o">Other</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-brand-text-muted">
                  Address
                </label>
                <input
                  type="text"
                  value={artistForm.address}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  First release year
                </label>
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={artistForm.first_release_year}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      first_release_year: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="2010"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Number of albums
                </label>
                <input
                  type="number"
                  min={0}
                  value={artistForm.no_of_albums_released}
                  onChange={(e) =>
                    setArtistForm((prev) => ({
                      ...prev,
                      no_of_albums_released: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                  onClick={() => {
                    if (artistSaving) return
                    setShowArtistModal(false)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={artistSaving}
                  className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft disabled:opacity-60"
                >
                  {artistSaving
                    ? editingArtist
                      ? 'Saving...'
                      : 'Creating...'
                    : editingArtist
                    ? 'Save changes'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit song modal */}
      {songModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-[11px] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-brand-text">
                {editingSong ? 'Edit song' : 'Create new song'}
              </h3>
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  if (songSaving) return
                  setSongModalOpen(false)
                }}
              >
                Close
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSaveSong}>
              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Artist <span className="text-red-400">*</span>
                </label>
                <select
                  value={songForm.artistId || ''}
                  onChange={(e) =>
                    setSongForm((prev) => ({
                      ...prev,
                      artistId: Number(e.target.value) || 0,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={songForm.title}
                  onChange={(e) =>
                    setSongForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Song title"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Album name
                </label>
                <input
                  type="text"
                  value={songForm.album_name}
                  onChange={(e) =>
                    setSongForm((prev) => ({
                      ...prev,
                      album_name: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text placeholder:text-brand-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-brand-text-muted">
                  Genre <span className="text-red-400">*</span>
                </label>
                <select
                  value={songForm.genre}
                  onChange={(e) =>
                    setSongForm((prev) => ({
                      ...prev,
                      genre: e.target.value as
                        | ''
                        | 'rnb'
                        | 'country'
                        | 'classic'
                        | 'rock'
                        | 'jazz',
                    }))
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-brand-text focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select genre</option>
                  <option value="rnb">R&B</option>
                  <option value="country">Country</option>
                  <option value="classic">Classic</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="text-[11px] text-brand-text-muted hover:text-brand-text"
                  onClick={() => {
                    if (songSaving) return
                    setSongModalOpen(false)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={songSaving}
                  className="rounded-lg bg-brand-primary px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-brand-primary-soft disabled:opacity-60"
                >
                  {songSaving
                    ? editingSong
                      ? 'Saving...'
                      : 'Creating...'
                    : editingSong
                    ? 'Save changes'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete song confirmation modal */}
      {songDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-[11px] shadow-2xl shadow-black/60">
            <h3 className="text-sm font-semibold text-brand-text mb-2">
              Delete song
            </h3>
            <p className="text-brand-text-muted mb-3">
              Are you sure you want to delete{' '}
              <span className="font-medium text-brand-text">
                {songDeleteTarget.title}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="text-[11px] text-brand-text-muted hover:text-brand-text"
                onClick={() => {
                  if (songDeleteLoading) return
                  setSongDeleteTarget(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={songDeleteLoading}
                onClick={handleDeleteSong}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-red-400 disabled:opacity-60"
              >
                {songDeleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-950 px-5 py-4 text-[11px] shadow-2xl shadow-black/60">
            <h3 className="text-sm font-semibold text-brand-text mb-2">
              Delete artist
            </h3>
            <p className="text-brand-text-muted mb-3">
              Are you sure you want to delete{' '}
              <span className="font-medium text-brand-text">
                {deleteTarget.name}
              </span>
              ? This will also remove all of their songs.
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
                onClick={handleDeleteArtist}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-red-400 disabled:opacity-60"
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

export default ArtistManagerDashboard

