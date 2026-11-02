import type { Laptop } from '@/types'
import type {
  CompatibilityBand,
  FutureProofItem,
  GpuWorkloadItem,
  PricingPoint,
  TrendPoint,
} from '@/types/analytics'

export function scoreGpuTier(gpu: string): { tier: string; ai: number; gaming: number; creative: number } {
  const g = gpu.toLowerCase()
  if (/4090|4080|m3 max/.test(g)) return { tier: 'Enthusiast', ai: 98, gaming: 99, creative: 95 }
  if (/4070|4060|m3 pro|7900|7800/.test(g)) return { tier: 'High', ai: 88, gaming: 90, creative: 88 }
  if (/4050|3050|m3|6700|a770/.test(g)) return { tier: 'Mid', ai: 72, gaming: 75, creative: 70 }
  if (/integrated|iris|uhd|radeon/.test(g)) return { tier: 'Integrated', ai: 40, gaming: 35, creative: 55 }
  return { tier: 'Standard', ai: 60, gaming: 58, creative: 60 }
}

export function buildGpuWorkloadData(laptops: Laptop[]): GpuWorkloadItem[] {
  return laptops
    .map((lp) => {
      const s = scoreGpuTier(lp.gpu)
      return {
        name: lp.name.length > 22 ? lp.name.slice(0, 22) + '…' : lp.name,
        brand: lp.brand,
        gpu: lp.gpu.split(' ').slice(0, 2).join(' '),
        aiScore: s.ai,
        gamingScore: s.gaming,
        creativeScore: s.creative,
        tier: s.tier,
      }
    })
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 8)
}

export function computeFutureProofScore(lp: Laptop): number {
  const gpu = scoreGpuTier(lp.gpu)
  let score = 45
  score += Math.min(18, lp.ram_gb * 1.1)
  score += Math.min(12, lp.storage_gb / 85)
  score += gpu.ai * 0.12
  score += Math.min(10, lp.rating * 2)
  return Math.min(99, Math.round(score))
}

export function buildFutureProofData(laptops: Laptop[]): FutureProofItem[] {
  return laptops
    .map((lp) => {
      const score = computeFutureProofScore(lp)
      const years = score >= 85 ? '5+ yrs' : score >= 70 ? '3–4 yrs' : score >= 55 ? '2–3 yrs' : '1–2 yrs'
      return {
        name: lp.name.length > 20 ? lp.name.slice(0, 20) + '…' : lp.name,
        brand: lp.brand,
        score,
        ram: lp.ram_gb,
        storage: lp.storage_gb,
        years,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}

export function buildCompatibilityBands(laptops: Laptop[]): CompatibilityBand[] {
  const bands = [
    { range: '90–100%', min: 90, fill: '#10b981' },
    { range: '75–89%', min: 75, fill: '#3b82f6' },
    { range: '60–74%', min: 60, fill: '#8b5cf6' },
    { range: 'Below 60%', min: 0, fill: '#94a3b8' },
  ]
  const scores = laptops.map((lp) => {
    const gpu = scoreGpuTier(lp.gpu)
    return Math.min(
      98,
      Math.round(50 + lp.rating * 8 + gpu.ai * 0.15 + (lp.ram_gb >= 16 ? 5 : 0))
    )
  })
  return bands.map((b, i) => {
    const max = i === 0 ? 101 : bands[i - 1].min
    const count = scores.filter((s) => s >= b.min && s < max).length
    return { range: b.range, count, fill: b.fill }
  })
}

export function buildPricingScatter(laptops: Laptop[]): PricingPoint[] {
  return laptops.map((lp) => ({
    brand: lp.brand,
    name: lp.name,
    price: lp.price,
    rating: lp.rating,
  }))
}

export function buildPriceByBrand(laptops: Laptop[]): { brand: string; avgPrice: number; count: number }[] {
  const map: Record<string, { sum: number; count: number }> = {}
  laptops.forEach((lp) => {
    if (!map[lp.brand]) map[lp.brand] = { sum: 0, count: 0 }
    map[lp.brand].sum += lp.price
    map[lp.brand].count += 1
  })
  return Object.entries(map)
    .map(([brand, v]) => ({ brand, avgPrice: Math.round(v.sum / v.count), count: v.count }))
    .sort((a, b) => b.avgPrice - a.avgPrice)
}

export function buildRecommendationTrend(
  historyCount: number,
  avgPrice: number
): TrendPoint[] {
  const periods = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
  const base = 70 + Math.min(historyCount * 4, 22)
  return periods.map((period, i) => ({
    period,
    matchScore: Math.min(97, base + i * 2.5 + (i % 2)),
    sessions: Math.max(0, Math.round(historyCount * (0.2 + i * 0.12))),
    avgPrice: Math.round(avgPrice * (0.92 + i * 0.015)),
  }))
}

export function generateAIInsight(
  laptops: Laptop[],
  historyCount: number,
  avgMatch: number
): string {
  const top = [...laptops].sort((a, b) => b.rating - a.rating)[0]
  const gaming = laptops.filter((l) => l.use_cases.includes('gaming')).length
  const avgPrice = laptops.reduce((s, l) => s + l.price, 0) / (laptops.length || 1)

  const parts: string[] = []
  parts.push(
    `Across ${laptops.length} indexed laptops, average catalog price is $${Math.round(avgPrice).toLocaleString()} with ${gaming} gaming-class options.`
  )
  if (historyCount > 0) {
    parts.push(
      `Your ${historyCount} recommendation session${historyCount > 1 ? 's' : ''} show an average compatibility of ${avgMatch}%, indicating strong alignment between preferences and catalog.`
    )
  } else {
    parts.push('Run an AI recommendation session to unlock personalized trend analysis.')
  }
  if (top) {
    parts.push(
      `${top.brand} ${top.name} currently leads the catalog with a ${top.rating.toFixed(1)} rating — strong for balanced performance workloads.`
    )
  }
  return parts.join(' ')
}

export const CHATBOT_RESPONSES: Record<string, string> = {
  help: 'I can explain pricing trends, GPU workloads, compatibility scores, and future-proof ratings. Try: "pricing", "gpu", "compatibility", or "recommend".',
  pricing: 'The pricing chart shows per-brand averages and scatter by rating. Budget options cluster under $800; premium builds exceed $1,500.',
  gpu: 'GPU workload analysis scores each laptop for AI/ML, gaming, and creative tasks based on GPU tier detection (RTX, Apple Silicon, integrated).',
  compatibility: 'Compatibility bands estimate how well each laptop matches typical user profiles using CPU, GPU, RAM, and rating signals.',
  future: 'Future-proof scores weight RAM, storage, GPU tier, and ratings to estimate useful lifespan (1–5+ years).',
  recommend: 'Go to AI Recommend to run the ML engine with your budget, usage tags, and preferences. Results include match %, explanations, and radar charts.',
  trend: 'Recommendation trends track weekly match scores and session volume based on your history.',
  default: 'Ask about pricing, GPU analysis, compatibility, future-proof scores, or recommendations. Type "help" for topics.',
}

export function getChatbotReply(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('help') || q.includes('what can')) return CHATBOT_RESPONSES.help
  if (q.includes('price') || q.includes('cost') || q.includes('budget')) return CHATBOT_RESPONSES.pricing
  if (q.includes('gpu') || q.includes('graphics') || q.includes('ai') || q.includes('ml')) return CHATBOT_RESPONSES.gpu
  if (q.includes('compat') || q.includes('match') || q.includes('score')) return CHATBOT_RESPONSES.compatibility
  if (q.includes('future') || q.includes('proof') || q.includes('longevity')) return CHATBOT_RESPONSES.future
  if (q.includes('recommend') || q.includes('suggest') || q.includes('find')) return CHATBOT_RESPONSES.recommend
  if (q.includes('trend') || q.includes('history') || q.includes('session')) return CHATBOT_RESPONSES.trend
  return CHATBOT_RESPONSES.default
}
