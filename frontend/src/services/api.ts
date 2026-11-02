import axios from 'axios'
import type {
  AnalyticsOverview,
  CatalogAnalytics,
  TrendingLaptopItem,
  UserAnalytics,
} from '@/types/analytics'
import type {
  AuthResponse,
  ComparisonResponse,
  Laptop,
  RecommendationPreferences,
  RecommendationResponse,
  User,
} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('findtech_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthAttempt =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register')

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('findtech_token')
      localStorage.removeItem('findtech_user')

      const currentPath = window.location.pathname
      const isPublicPath =
        currentPath === '/' ||
        currentPath === '/login' ||
        currentPath === '/register' ||
        currentPath === '/browse' ||
        currentPath === '/compare' ||
        currentPath === '/recommend' ||
        currentPath === '/analytics' ||
        currentPath.startsWith('/laptops/')

      if (!isPublicPath) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
}

export const laptopsApi = {
  list: (params?: { brand?: string; min_price?: number; max_price?: number; search?: string }) =>
    api.get<Laptop[]>('/laptops', { params }),
  get: (id: string) => api.get<Laptop>(`/laptops/${id}`),
  brands: () => api.get<string[]>('/laptops/brands/list'),
}

export const recommendationsApi = {
  generate: (preferences: RecommendationPreferences) =>
    api.post<RecommendationResponse>('/recommendations', preferences),
  history: () => api.get<{ id: string; created_at: string; count: number }[]>('/recommendations/history'),
  historyDetail: (id: string) =>
    api.get<{
      id: string
      created_at: string
      preferences: RecommendationPreferences
      result_count: number
      top_laptops: Laptop[]
    }>(`/recommendations/history/${id}`),
}

export const comparisonApi = {
  compare: (laptopIds: string[]) =>
    api.post<ComparisonResponse>('/comparison', { laptop_ids: laptopIds }),
}

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>('/analytics/overview'),
  catalog: () => api.get<CatalogAnalytics>('/analytics/catalog'),
  trending: (limit = 10) =>
    api.get<TrendingLaptopItem[]>('/analytics/trending', { params: { limit } }),
  user: () => api.get<UserAnalytics>('/analytics/user'),
}

export default api
