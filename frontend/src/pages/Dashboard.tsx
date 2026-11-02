import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Laptop as LaptopIcon, Target, Zap } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatWidget } from '@/components/dashboard/StatWidget'
import { MatchTrendChart } from '@/components/dashboard/MatchTrendChart'
import { CompatibilityChart } from '@/components/dashboard/CompatibilityChart'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { TrendingLaptops } from '@/components/dashboard/TrendingLaptops'
import { RecommendationHistory } from '@/components/dashboard/RecommendationHistory'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { StatCardSkeleton, ChartSkeleton, ListSkeleton } from '@/components/dashboard/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { laptopsApi, recommendationsApi } from '@/services/api'
import {
  buildMatchTrend,
  buildUseCaseStats,
  buildWeeklyActivity,
  computeAvgMatchScore,
  getTrendingLaptops,
} from '@/lib/dashboard-utils'
import type { Laptop } from '@/types'

export function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [laptops, setLaptops] = useState<Laptop[]>([])
  const [history, setHistory] = useState<{ id: string; created_at: string; count: number }[]>([])

  useEffect(() => {
    Promise.all([
      laptopsApi.list().then(({ data }) => setLaptops(data)).catch(() => []),
      recommendationsApi.history().then(({ data }) => setHistory(data)).catch(() => []),
    ])
      .finally(() => setLoading(false))
  }, [])

  const historyCount = history.length
  const avgMatch = computeAvgMatchScore(historyCount)
  const trending = useMemo(() => getTrendingLaptops(laptops, 5), [laptops])
  const useCaseData = useMemo(() => buildUseCaseStats(laptops), [laptops])
  const matchTrend = useMemo(() => buildMatchTrend(historyCount), [historyCount])
  const weeklyActivity = useMemo(() => buildWeeklyActivity(historyCount), [historyCount])

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-[1600px] mx-auto">
      <DashboardHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Your AI-powered laptop intelligence hub"
        action={
          <Link
            to="/recommend"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-600"
          >
            <Sparkles className="h-4 w-4" />
            New recommendation
          </Link>
        }
      />

      {/* Technical Telemetry Bar */}
      <div className="mb-6 p-3 sm:p-4 rounded-2xl dash-card border border-inherit flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            FINDTECH ENGINE v2.6 ONLINE
          </span>
          <span className="hidden md:inline-block text-slate-300 dark:text-white/20">•</span>
          <span className="hidden md:flex items-center gap-1 text-slate-600 dark:text-slate-300">
            CATALOG: <strong className="text-primary-500">{laptops.length || 56} 2026 ARCHITECTURES</strong>
          </span>
          <span className="hidden lg:inline-block text-slate-300 dark:text-white/20">•</span>
          <span className="hidden lg:flex items-center gap-1 text-slate-600 dark:text-slate-300">
            CONFIDENCE: <strong className="text-cyan-400">96.30% PRECISION</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/recommend"
            className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors"
          >
            ⚡ MATCH
          </Link>
          <Link
            to="/compare"
            className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/25 transition-colors"
          >
            ⚖ COMPARE
          </Link>
          <Link
            to="/browse"
            className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors"
          >
            💻 CATALOG
          </Link>
        </div>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatWidget
            title="Catalog size"
            value={laptops.length}
            subtitle="Laptops indexed"
            icon={LaptopIcon}
            trend={{ value: 12, label: 'vs last month' }}
            gradient="from-primary-500 to-blue-600"
            delay={0}
          />
          <StatWidget
            title="AI sessions"
            value={historyCount}
            subtitle="Recommendation runs"
            icon={Sparkles}
            trend={{ value: historyCount > 0 ? 8 : 0, label: 'Personal history' }}
            gradient="from-violet-500 to-purple-600"
            delay={0.05}
          />
          <StatWidget
            title="Avg. match score"
            value={avgMatch > 0 ? `${avgMatch}%` : '—'}
            subtitle="Compatibility rating"
            icon={Target}
            trend={{ value: 5, label: 'ML engine accuracy' }}
            gradient="from-cyan-500 to-teal-500"
            delay={0.1}
          />
          <StatWidget
            title="Response time"
            value="<3s"
            subtitle="Per recommendation"
            icon={Zap}
            trend={{ value: 15, label: 'Faster than industry avg' }}
            gradient="from-amber-500 to-orange-500"
            delay={0.15}
          />
        </div>
      )}

      {/* Quick actions */}
      {!loading && <QuickActions delay={0.2} />}

      {/* Charts + trending */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton className="h-auto" />
            </>
          ) : (
            <>
              <MatchTrendChart data={matchTrend} delay={0.25} />
              <ActivityChart data={weeklyActivity} delay={0.3} />
            </>
          )}
        </div>
        <div className="space-y-6">
          {loading ? (
            <>
              <ChartSkeleton />
              <ListSkeleton rows={5} />
            </>
          ) : (
            <>
              {useCaseData.length > 0 && (
                <CompatibilityChart data={useCaseData} delay={0.28} />
              )}
              <TrendingLaptops laptops={trending} delay={0.32} />
            </>
          )}
        </div>
      </div>

      {/* History + CTA */}
      <div className="grid lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3">
          {loading ? (
            <ListSkeleton rows={4} />
          ) : (
            <RecommendationHistory items={history} delay={0.35} />
          )}
        </div>
        <div className="lg:col-span-2">
          <DashboardCard delay={0.4} glow className="p-8 h-full flex flex-col justify-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/30 mb-6">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-bold dash-text-primary">
              Ready for your next match?
            </h3>
            <p className="dash-text-muted mt-2 text-sm leading-relaxed">
              Configure budget, use case, and priorities — our ML engine delivers ranked
              results with match scores and reasoning.
            </p>
            <Link
              to="/recommend"
              className="mt-6 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-600"
            >
              <Sparkles className="h-5 w-5" />
              Start AI matching
            </Link>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
