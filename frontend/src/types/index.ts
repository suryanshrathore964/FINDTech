export interface User {
  id: string
  email: string
  full_name: string
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Laptop {
  id: string
  name: string
  brand: string
  price: number
  cpu: string
  gpu: string
  ram_gb: number
  storage_gb: number
  display: string
  battery_hours: number
  weight_kg: number
  use_cases: string[]
  image_url: string
  rating: number
  tags: string[]
}

export interface RecommendationPreferences {
  budget_min: number
  budget_max: number
  primary_use: string
  portability: number
  performance: number
  battery_priority: number
  brand_preferences: string[]
  ram_min: number
  storage_min: number
}

export interface RecommendationResult {
  laptop: Laptop
  match_score: number
  reasons: string[]
}

export interface RecommendationResponse {
  recommendations: RecommendationResult[]
  preferences_id?: string
}

export interface CategoryWinner {
  category: string
  winner_id: string
  winner_name: string
  reason: string
}

export interface ComparisonResponse {
  laptops: Laptop[]
  winners: CategoryWinner[]
  summary: string
}

