import type { Laptop, RecommendationPreferences, RecommendationResult } from './index'

export type Profession =
  | 'developer'
  | 'designer'
  | 'student'
  | 'engineer'
  | 'content_creator'
  | 'business'
  | 'researcher'

export type GamingLevel = 'none' | 'casual' | 'competitive' | 'streaming'
export type EditingLevel = 'none' | 'photo' | 'video' | '3d'
export type UsageIntensity = 'light' | 'moderate' | 'heavy' | 'extreme'

export interface RecommendFormState {
  budgetMin: number
  budgetMax: number
  profession: Profession
  aiMlWorkload: boolean
  gaming: GamingLevel
  editing: EditingLevel
  portability: number
  battery: number
  softwareStack: string[]
  usageIntensity: UsageIntensity
  brandPreferences: string[]
}

export interface PerformanceBreakdown {
  cpu: number
  gpu: number
  ram: number
  battery: number
  storage: number
  portability: number
}

export interface EnrichedRecommendation extends RecommendationResult {
  compatibilityScore: number
  futureProofScore: number
  aiExplanation: string
  performance: PerformanceBreakdown
}

export type { RecommendationPreferences, RecommendationResult, Laptop }
