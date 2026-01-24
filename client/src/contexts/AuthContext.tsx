import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { api } from '@/services/api'
import * as authService from '@/services/auth'
import type { User, LoginCredentials, RegisterCredentials } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authService.getCurrentUser()
      setUser(user)
    } catch {
      // User not authenticated or token expired
      setUser(null)
      api.setAccessToken(null)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        api.setAccessToken(accessToken)
        await refreshUser()
      }
      setIsLoading(false)
    }

    initAuth()
  }, [refreshUser])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return

    // Refresh every 14 minutes (token expires in 15 minutes)
    const interval = setInterval(async () => {
      try {
        await authService.refreshTokens()
      } catch {
        // Refresh failed, user needs to re-login
        setUser(null)
        api.setAccessToken(null)
      }
    }, 14 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  const login = async (credentials: LoginCredentials) => {
    const { user } = await authService.login(credentials)
    setUser(user)
  }

  const register = async (credentials: RegisterCredentials) => {
    const { user } = await authService.register(credentials)
    setUser(user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
