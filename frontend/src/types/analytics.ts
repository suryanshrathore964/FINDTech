export interface BrandDistribution {
  brand: string
  count: number
  percentage: number
}

export interface PriceRangeBucket {
  range_label: string
  min_price: number
  max_price: number
  count: number
}

export interface UseCaseDistribution {
  use_case: string
  count: number
}

export interface CatalogAnalytics {
  total_laptops: number
  avg_price: number
  avg_rating: number
  brands: BrandDistribution[]
  price_ranges: PriceRangeBucket[]
  use_cases: UseCaseDistribution[]
}

export interface UserAnalytics {
  total_sessions: number
  total_matches: number
  avg_matches_per_session: number
  recent_activity_days: number
}

export interface AnalyticsOverview {
  catalog: CatalogAnalytics
  users_count: number
  total_recommendation_sessions: number
}

export interface TrendingLaptopItem {
  id: string
  name: string
  brand: string
  price: number
  rating: number
  image_url: string
}

export interface GpuWorkloadItem {
  name: string
  brand: string
  gpu: string
  aiScore: number
  gamingScore: number
  creativeScore: number
  tier: string
}

export interface FutureProofItem {
  name: string
  brand: string
  score: number
  ram: number
  storage: number
  years: string
}

export interface CompatibilityBand {
  range: string
  count: number
  fill: string
}

export interface PricingPoint {
  brand: string
  name: string
  price: number
  rating: number
}

export interface TrendPoint {
  period: string
  matchScore: number
  sessions: number
  avgPrice: number
}
