import { api } from './api'
import type { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types'

interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const result = await api.post<AuthResponse>('/auth/register', credentials)
  api.setAccessToken(result.tokens.accessToken)
  localStorage.setItem('refreshToken', result.tokens.refreshToken)
  return result
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const result = await api.post<AuthResponse>('/auth/login', credentials)
  api.setAccessToken(result.tokens.accessToken)
  localStorage.setItem('refreshToken', result.tokens.refreshToken)
  return result
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // Ignore logout errors
    }
  }
  api.setAccessToken(null)
  localStorage.removeItem('refreshToken')
}

export async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const result = await api.post<AuthTokens>('/auth/refresh', { refreshToken })
  api.setAccessToken(result.accessToken)
  localStorage.setItem('refreshToken', result.refreshToken)
  return result
}

export async function getCurrentUser(): Promise<{ user: User }> {
  return api.get<{ user: User }>('/auth/me')
}
