import type { Laptop } from '@/types'

export function buildUseCaseStats(laptops: Laptop[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  laptops.forEach((lp) => {
    lp.use_cases.forEach((uc) => {
      counts[uc] = (counts[uc] || 0) + 1
    })
  })
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

export function buildMatchTrend(historyCount: number): { month: string; score: number; sessions: number }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const base = 72 + Math.min(historyCount * 3, 20)
  return months.map((month, i) => ({
    month,
    score: Math.min(98, base + i * 2 + (i % 3)),
    sessions: Math.max(0, historyCount - (5 - i)),
  }))
}

export function buildWeeklyActivity(historyCount: number): { day: string; recommendations: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const peak = Math.max(1, historyCount)
  return days.map((day, i) => ({
    day,
    recommendations: Math.max(0, Math.round(peak * (0.3 + (i % 3) * 0.2) + (i === 4 ? peak * 0.5 : 0))),
  }))
}

export function getTrendingLaptops(laptops: Laptop[], limit = 5): Laptop[] {
  return [...laptops].sort((a, b) => b.rating - a.rating || b.price - a.price).slice(0, limit)
}

export function computeAvgMatchScore(historyCount: number): number {
  if (historyCount === 0) return 0
  return Math.min(96, 78 + historyCount * 2)
}
