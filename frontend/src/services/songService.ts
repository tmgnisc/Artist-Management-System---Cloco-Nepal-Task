import { apiRequest } from '../lib/apiClient'
import type { PaginatedResponse, PaginationMeta } from '../types/api'

export type Song = {
  id: number
  artist_id: number
  artist_name?: string | null
  title: string
  album_name: string | null
  genre: 'rnb' | 'country' | 'classic' | 'rock' | 'jazz'
  created_at: string
  updated_at: string
}

export type SongListResponse = PaginatedResponse<Song>

type ArtistWithSongsResponse = {
  artist: {
    id: number
    name: string
  }
  songs: Song[]
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

  const res = await apiRequest<ArtistWithSongsResponse>(
    `/artists/${artistId}/songs?${query.toString()}`,
    'GET',
    undefined,
    {
      auth: true,
    },
  )

  return {
    items: res.songs,
    pagination: {
      currentPage: page,
      totalPages: 1,
      totalItems: res.songs.length,
      itemsPerPage: limit,
    },
  }
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
  const res = await apiRequest<{
    songs: Song[]
    pagination: PaginationMeta
  }>(path, 'GET', undefined, {
    auth: true,
  })

  return {
    items: res.songs,
    pagination: res.pagination,
  }
}

export type SongPayload = {
  title: string
  album_name?: string
  genre: 'rnb' | 'country' | 'classic' | 'rock' | 'jazz'
}

export async function createSongForArtist(
  artistId: number,
  payload: SongPayload,
): Promise<{ artist: ArtistWithSongsResponse['artist']; song: Song }> {
  return apiRequest<{ artist: ArtistWithSongsResponse['artist']; song: Song }>(
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
