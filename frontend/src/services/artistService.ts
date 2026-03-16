import { apiRequest } from '../lib/apiClient'
import { API_BASE_URL } from '../config/api'

export type Artist = {
  id: number
  name: string
  dob: string | null
  gender: 'm' | 'f' | 'o' | null
  address: string | null
  first_release_year: number | null
  no_of_albums_released: number | null
  created_at: string
  updated_at: string
}

export type ArtistListParams = {
  page?: number
  limit?: number
  search?: string
}

export type ArtistListResponse = {
  artists: Artist[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
  }
}

export async function listArtists(
  params: ArtistListParams = {},
): Promise<ArtistListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)

  const path = `/artists${query.toString() ? `?${query.toString()}` : ''}`
  return apiRequest<ArtistListResponse>(path, 'GET', undefined, {
    auth: true,
  })
}

export type ArtistPayload = {
  name: string
  dob?: string
  gender?: 'm' | 'f' | 'o'
  address?: string
  first_release_year?: number
  no_of_albums_released?: number
}

export async function createArtist(payload: ArtistPayload): Promise<Artist> {
  return apiRequest<Artist>('/artists', 'POST', payload, { auth: true })
}

export async function updateArtist(
  id: number,
  payload: Partial<ArtistPayload>,
): Promise<Artist> {
  return apiRequest<Artist>(`/artists/${id}`, 'PUT', payload, { auth: true })
}

export async function deleteArtist(id: number): Promise<void> {
  await apiRequest(`/artists/${id}`, 'DELETE', undefined, { auth: true })
}

export async function importArtistsCsv(file: File): Promise<{ count: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('accessToken')

  const response = await fetch(`${API_BASE_URL}/artists/import/csv`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to import artists CSV')
  }

  return response.json()
}

export async function exportArtistsCsv(): Promise<Blob> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/artists/export/csv`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Failed to export artists CSV')
  }
  return response.blob()
}

