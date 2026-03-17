import { apiRequest } from '../lib/apiClient'

export interface LoginResponse {
  user: {
    id: number
    email: string
    role: 'super_admin' | 'artist_manager' | 'artist'
    first_name?: string
    last_name?: string
  }
  accessToken: string
  refreshToken: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  phone?: string
  dob?: string
  gender: 'm' | 'f' | 'o'
  address?: string
  role?: 'super_admin' | 'artist_manager' | 'artist'
}

export async function login(email: string, password: string) {
  const result = await apiRequest<LoginResponse>('/auth/login', 'POST', {
    email,
    password,
  })
  return result
}

export async function registerArtistManager(payload: RegisterPayload) {
  const body: RegisterPayload = {
    ...payload,
    role: 'artist_manager',
  }

  return apiRequest<LoginResponse>('/auth/register', 'POST', body)
}
