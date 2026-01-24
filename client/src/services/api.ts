import { API_BASE_URL } from '@/config/constants'
import type { ApiResponse, ApiError } from '@/types'

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.accessToken = localStorage.getItem('accessToken')
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token
    if (token) {
      localStorage.setItem('accessToken', token)
    } else {
      localStorage.removeItem('accessToken')
    }
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      throw new ApiRequestError(
        error.error.message,
        response.status,
        error.error.code,
        error.error.details
      )
    }

    return (data as ApiResponse<T>).data
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const formData = new FormData()
    formData.append(fieldName, file)

    const headers: HeadersInit = {}
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      const error = data as ApiError
      throw new ApiRequestError(
        error.error.message,
        response.status,
        error.error.code,
        error.error.details
      )
    }

    return (data as ApiResponse<T>).data
  }
}

export class ApiRequestError extends Error {
  statusCode: number
  code: string
  details?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export const api = new ApiClient(API_BASE_URL)
