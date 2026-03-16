import { apiRequest } from '../lib/apiClient'

export type Song = {
  id: number
  artist_id: number
  title: string
  album_name: string | null
  genre: 'rnb' | 'country' | 'classic' | 'rock' | 'jazz'
  created_at: string
  updated_at: string
}

export type SongListResponse = {
  songs: Song[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems?: number
    itemsPerPage?: number
  }
}

export async function listSongsForArtist(
  artistId: number,
  page = 1,
  limit = 10,
): Promise<SongListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return apiRequest<SongListResponse>(
    `/artists/${artistId}/songs?${query.toString()}`,
    'GET',
    undefined,
    { auth: true },
  )
}

export type SongListParams = {
  page?: number
  limit?: number
  artistId?: number
}

// Admin / manager view: list all songs with optional artist filter
export async function listAllSongs(
  params: SongListParams = {},
): Promise<SongListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.artistId) query.set('artistId', String(params.artistId))

  const path = `/songs${query.toString() ? `?${query.toString()}` : ''}`
  return apiRequest<SongListResponse>(path, 'GET', undefined, {
    auth: true,
  })
}

export type SongPayload = {
  title: string
  album_name?: string
  genre: 'rnb' | 'country' | 'classic' | 'rock' | 'jazz'
}

export async function createSongForArtist(
  artistId: number,
  payload: SongPayload,
): Promise<{ artist: any; song: Song }> {
  return apiRequest<{ artist: any; song: Song }>(
    `/artists/${artistId}/songs`,
    'POST',
    payload,
    { auth: true },
  )
}

export async function updateSong(
  id: number,
  payload: Partial<SongPayload>,
): Promise<{ song: Song }> {
  return apiRequest<{ song: Song }>(`/songs/${id}`, 'PUT', payload, {
    auth: true,
  })
}

export async function deleteSong(id: number): Promise<void> {
  await apiRequest(`/songs/${id}`, 'DELETE', undefined, { auth: true })
}


