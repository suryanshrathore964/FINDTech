import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/services/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persistSession = useCallback((token: string, userData: User) => {
    localStorage.setItem('findtech_token', token)
    localStorage.setItem('findtech_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('findtech_token')
    localStorage.removeItem('findtech_user')
    setUser(null)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login({ email, password })
      persistSession(data.access_token, data.user)
    },
    [persistSession]
  )

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data } = await authApi.register({
        email,
        password,
        full_name: fullName,
      })
      persistSession(data.access_token, data.user)
    },
    [persistSession]
  )

  useEffect(() => {
    const token = localStorage.getItem('findtech_token')
    const stored = localStorage.getItem('findtech_user')

    if (!token) {
      setIsLoading(false)
      return
    }

    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        logout()
      }
    }

    authApi
      .me()
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('findtech_user', JSON.stringify(data))
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [logout])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
