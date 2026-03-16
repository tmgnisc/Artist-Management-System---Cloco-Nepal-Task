import { apiRequest } from '../lib/apiClient'
import type { RegisterPayload } from './authService'

export type UserRole = 'super_admin' | 'artist_manager' | 'artist'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  dob?: string | null
  gender: 'm' | 'f' | 'o'
  address?: string | null
  role: UserRole
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ListUsersResponse {
  users: User[]
  pagination: PaginationMeta
}

export interface ListUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<ListUsersResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.role) query.set('role', params.role)

  const path = `/users${query.toString() ? `?${query.toString()}` : ''}`

  return apiRequest<ListUsersResponse>(path, 'GET', undefined, {
    auth: true,
  })
}

export async function createUser(
  payload: RegisterPayload & { role: UserRole },
): Promise<User> {
  const result = await apiRequest<{ user: User }>(
    '/users',
    'POST',
    payload,
    { auth: true },
  )
  return result.user
}

export async function updateUser(
  id: number,
  payload: Partial<RegisterPayload> & { role?: UserRole },
): Promise<User> {
  const result = await apiRequest<{ user: User }>(
    `/users/${id}`,
    'PUT',
    payload,
    { auth: true },
  )
  return result.user
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest<void>(`/users/${id}`, 'DELETE', undefined, {
    auth: true,
  })
}

