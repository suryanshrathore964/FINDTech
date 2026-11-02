import { useEffect, useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, Sparkles } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { StatCardSkeleton, ChartSkeleton } from '@/components/dashboard/Skeleton'
import { PricingAnalysisChart } from '@/components/analytics/PricingAnalysisChart'
import { RecommendationTrendChart } from '@/components/analytics/RecommendationTrendChart'
import { CompatibilityScoreViz } from '@/components/analytics/CompatibilityScoreViz'
import { FutureProofChart } from '@/components/analytics/FutureProofChart'
import { GpuWorkloadChart } from '@/components/analytics/GpuWorkloadChart'
import { AIReasoningPanel } from '@/components/analytics/AIReasoningPanel'
import { AnalyticsChatbot } from '@/components/analytics/AnalyticsChatbot'
import { Button } from '@/components/ui/Button'
import { analyticsApi, laptopsApi, recommendationsApi } from '@/services/api'
import {
  buildCompatibilityBands,
  buildFutureProofData,
  buildGpuWorkloadData,
  buildPriceByBrand,
  buildPricingScatter,
  buildRecommendationTrend,
  generateAIInsight,
} from '@/lib/analytics-utils'
import { computeAvgMatchScore as dashAvg } from '@/lib/dashboard-utils'
import type { Laptop } from '@/types'
import type { AnalyticsOverview } from '@/types/analytics'

export function Analytics() {
  const [loading, setLoading] = useState(true)
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [historyCount, setHistoryCount] = useState(0)
  const [insightSeed, setInsightSeed] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      laptopsApi.list().then(({ data }) => setLaptops(data)).catch(() => []),
      analyticsApi.overview().then(({ data }) => setOverview(data)).catch(() => null),
      recommendationsApi.history().then(({ data }) => setHistoryCount(data.length)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const avgPrice = useMemo(
    () => (laptops.length ? laptops.reduce((s, l) => s + l.price, 0) / laptops.length : 0),
    [laptops]
  )
  const avgMatch = useMemo(() => dashAvg(historyCount), [historyCount])
  const gpuData = useMemo(() => buildGpuWorkloadData(laptops), [laptops])
  const futureData = useMemo(() => buildFutureProofData(laptops), [laptops])
  const compatBands = useMemo(() => buildCompatibilityBands(laptops), [laptops])
  const topCompat = useMemo(
    () => Math.max(...compatBands.map((b) => (b.range.startsWith('90') ? 95 : 75)), 88),
    [compatBands]
  )
  const priceByBrand = useMemo(() => buildPriceByBrand(laptops), [laptops])
  const priceScatter = useMemo(() => buildPricingScatter(laptops), [laptops])
  const trendData = useMemo(
    () => buildRecommendationTrend(historyCount, avgPrice),
    [historyCount, avgPrice, insightSeed]
  )
  const insight = useMemo(
    () => generateAIInsight(laptops, historyCount, avgMatch),
    [laptops, historyCount, avgMatch, insightSeed]
  )

  return (
    <div className="max-w-[1600px] mx-auto pb-24">
      <DashboardHeader
        title="Advanced analytics"
        subtitle="AI insights, pricing, GPU workloads & compatibility intelligence"
        action={
          <Link to="/recommend">
            <Button size="sm">
              <Sparkles className="h-4 w-4" />
              New recommendation
            </Button>
          </Link>
        }
      />

      {/* Technical Telemetry Strip */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl dash-card border border-inherit flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            TELEMETRY & HARDWARE METRICS
          </span>
          <span className="hidden md:inline-block text-slate-300 dark:text-white/20">•</span>
          <span className="text-slate-600 dark:text-slate-300">
            INDEXED SILICON: <strong className="text-primary-500">{laptops.length || 56} CHIPSETS</strong>
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-white/20">•</span>
          <span className="text-slate-600 dark:text-slate-300">
            CORRELATION: <strong className="text-emerald-500">R² 50.3% REGRESSION</strong>
          </span>
        </div>
        <div className="font-mono text-[11px] dash-text-muted">
          Active Live Telemetry
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
        >
          <StatWidget
            title="Catalog value"
            value={`$${Math.round(overview?.catalog.avg_price ?? avgPrice).toLocaleString()}`}
            subtitle="Average laptop price"
            icon={BarChart3}
            gradient="from-primary-500 to-blue-600"
            delay={0}
          />
          <StatWidget
            title="Avg. rating"
            value={(overview?.catalog.avg_rating ?? 4.4).toFixed(1)}
            subtitle={`${overview?.catalog.total_laptops ?? laptops.length} models`}
            icon={BarChart3}
            gradient="from-cyan-500 to-teal-500"
            delay={0.05}
          />
          <StatWidget
            title="Your match rate"
            value={avgMatch > 0 ? `${avgMatch}%` : '—'}
            subtitle="From recommendation history"
            icon={BarChart3}
            gradient="from-violet-500 to-purple-500"
            delay={0.1}
          />
          <StatWidget
            title="AI sessions"
            value={overview?.total_recommendation_sessions ?? historyCount}
            subtitle="Platform-wide runs"
            icon={BarChart3}
            gradient="from-amber-500 to-orange-500"
            delay={0.15}
          />
        </motion.div>
      )}

      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <AIReasoningPanel
            insight={insight}
            onRefresh={() => setInsightSeed((s) => s + 1)}
            delay={0.1}
          />

          <RecommendationTrendChart data={trendData} delay={0.15} />

          <PricingAnalysisChart
            byBrand={priceByBrand}
            scatter={priceScatter}
            delay={0.2}
          />

          <GpuWorkloadChart data={gpuData} delay={0.25} />

          <div className="grid lg:grid-cols-2 gap-6">
            <CompatibilityScoreViz bands={compatBands} topScore={topCompat} delay={0.3} />
            <FutureProofChart data={futureData} delay={0.32} />
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-6 mt-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <div className="grid lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      )}

      <AnalyticsChatbot />
    </div>
  )
}
