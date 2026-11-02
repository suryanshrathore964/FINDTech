import type { RecommendationResult } from '@/types'
import type {
  EnrichedRecommendation,
  PerformanceBreakdown,
  RecommendFormState,
} from '@/types/recommend'

function scoreCpu(cpu: string): number {
  const c = cpu.toLowerCase()
  if (/m4 max|m4 pro|m3 max|i9|ryzen 9|hx 370|ultra 9/.test(c)) return 98
  if (/m4|m3 pro|m2 max|i7|ryzen 7|ultra 7/.test(c)) return 88
  if (/m3|m2 pro|snapdragon x elite|ultra 5|8840|i7-13620/.test(c)) return 80
  if (/m2|m1 pro|i5|ryzen 5|8640|7640/.test(c)) return 72
  if (/m1|snapdragon x plus|i3|ryzen 3|celeron|n100/.test(c)) return 50
  return 65
}

function scoreGpu(gpu: string): number {
  const g = gpu.toLowerCase()
  if (/4090|4080|m4 max|m3 max/.test(g)) return 99
  if (/4070|m4 pro|m3 pro|rx 7900/.test(g)) return 88
  if (/4060|m4|rx 7700|rtx 3070/.test(g)) return 80
  if (/4050|3050|m3|m2|arc a770|arc a570/.test(g)) return 70
  if (/radeon 780m|radeon 890m|arc 140v|adreno/.test(g)) return 55
  if (/integrated|iris|uhd|radeon graphics/.test(g)) return 40
  return 58
}

function buildPerformance(laptop: RecommendationResult['laptop']): PerformanceBreakdown {
  return {
    cpu: scoreCpu(laptop.cpu),
    gpu: scoreGpu(laptop.gpu),
    ram: Math.min(100, (laptop.ram_gb / 32) * 100),
    battery: Math.min(100, (laptop.battery_hours / 20) * 100),
    storage: Math.min(100, (laptop.storage_gb / 1024) * 100),
    portability: Math.min(100, Math.max(20, (2.8 - laptop.weight_kg) / 1.8 * 100)),
  }
}

function computeFutureProof(
  laptop: RecommendationResult['laptop'],
  form: RecommendFormState
): number {
  let score = 50
  score += Math.min(20, laptop.ram_gb * 1.2)
  score += Math.min(15, laptop.storage_gb / 80)
  score += scoreCpu(laptop.cpu) * 0.15
  score += scoreGpu(laptop.gpu) * 0.1
  if (form.aiMlWorkload && laptop.ram_gb >= 16) score += 8
  if (form.editing === '3d' && scoreGpu(laptop.gpu) > 70) score += 6
  return Math.min(99, Math.round(score))
}

function buildAiExplanation(
  result: RecommendationResult,
  form: RecommendFormState,
  perf: PerformanceBreakdown
): string {
  const parts: string[] = []
  const pct = Math.round(result.match_score * 100)

  parts.push(
    `Our ML engine rates this laptop at ${pct}% compatibility for your ${form.profession.replace('_', ' ')} profile`
  )

  if (form.aiMlWorkload && perf.ram >= 60) {
    parts.push('with sufficient memory headroom for AI/ML workloads')
  }
  if (form.gaming !== 'none' && perf.gpu >= 70) {
    parts.push(`and GPU performance suited for ${form.gaming} gaming`)
  }
  if (form.editing !== 'none' && perf.cpu >= 70) {
    parts.push(`plus strong CPU throughput for ${form.editing} editing`)
  }
  if (form.softwareStack.length > 0) {
    parts.push(`aligned with your stack (${form.softwareStack.slice(0, 3).join(', ')}${form.softwareStack.length > 3 ? '…' : ''})`)
  }

  if (result.reasons.length > 0) {
    parts.push(`Key factors: ${result.reasons.slice(0, 2).join('; ').toLowerCase()}.`)
  }

  return parts.join(', ') + '.'
}

export function enrichRecommendations(
  results: RecommendationResult[],
  form: RecommendFormState
): EnrichedRecommendation[] {
  return results.map((r) => {
    const performance = buildPerformance(r.laptop)
    return {
      ...r,
      compatibilityScore: Math.round(r.match_score * 100),
      futureProofScore: computeFutureProof(r.laptop, form),
      performance,
      aiExplanation: buildAiExplanation(r, form, performance),
    }
  })
}
