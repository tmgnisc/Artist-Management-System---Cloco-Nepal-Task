import { API_BASE_URL } from '../config/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiErrorShape {
  message: string
  errors?: { field?: string; message: string }[]
}

export class ApiError extends Error {
  status: number
  data?: ApiErrorShape

  constructor(status: number, data?: ApiErrorShape) {
    super(data?.message || 'Request failed')
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (options.auth) {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    ...options,
  })

  const contentType = response.headers.get('Content-Type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : undefined

  if (!response.ok) {
    const errorPayload: ApiErrorShape | undefined =
      data && typeof data === 'object'
        ? (data.error as ApiErrorShape) || (data as ApiErrorShape)
        : undefined
    throw new ApiError(response.status, errorPayload)
  }

  return (data?.data ?? data) as T
}

