import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Wand2, Cpu, Zap, Activity } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { RecommendationForm } from '@/components/recommend/RecommendationForm'
import { RecommendationResultCard } from '@/components/recommend/RecommendationResultCard'
import { ListSkeleton } from '@/components/dashboard/Skeleton'
import { recommendationsApi } from '@/services/api'
import { DEFAULT_FORM_STATE, mapFormToApiPreferences } from '@/lib/recommend-mapper'
import { enrichRecommendations } from '@/lib/recommend-enrichment'
import type { RecommendFormState, EnrichedRecommendation } from '@/types/recommend'

export function Recommend() {
  const [form, setForm] = useState<RecommendFormState>(DEFAULT_FORM_STATE)
  const [results, setResults] = useState<EnrichedRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)

  const updateForm = (patch: Partial<RecommendFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResults([])
    try {
      const prefs = mapFormToApiPreferences(form)
      const { data } = await recommendationsApi.generate(prefs)
      setResults(enrichRecommendations(data.recommendations, form))
      setSearched(true)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    } catch {
      setError('Failed to generate recommendations. Ensure the API is running.')
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <DashboardHeader
        title="AI Laptop Recommendations"
        subtitle="Advanced preference engine — budget, workload, software stack & more"
        action={
          <div className="hidden md:flex items-center gap-2">
            <span className="tech-pill text-xs flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              GRADIENT BOOSTING ENSEMBLE
            </span>
          </div>
        }
      />

      {/* Technical Telemetry Strip */}
      <div className="mb-6 p-3 rounded-2xl dash-card border border-inherit flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono font-medium text-slate-700 dark:text-slate-300">
            <Cpu className="h-4 w-4 text-primary-500" />
            <span>MODEL:</span>
            <span className="text-primary-600 dark:text-cyan-400 font-bold">GBR-168K-v2.6</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-medium text-slate-700 dark:text-slate-300">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>PRECISION:</span>
            <span className="text-emerald-500 font-bold">96.30% CV</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono font-medium text-slate-700 dark:text-slate-300">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>INFERENCE:</span>
            <span className="text-amber-500 font-bold">&lt; 3.0ms</span>
          </div>
        </div>
        <div className="text-[11px] font-mono dash-text-muted">
          56 Silicon Architectures • Real-time Cross Matching
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-4">
          <RecommendationForm
            form={form}
            onChange={updateForm}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>

        <div ref={resultsRef} className="xl:col-span-8 scroll-mt-20">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="dash-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Wand2 className="h-12 w-12 text-primary-500" />
                  </motion.div>
                  <p className="dash-text-primary font-semibold mt-6">ML engine analyzing catalog…</p>
                  <p className="text-sm dash-text-muted mt-2">Scoring compatibility across 50+ laptops</p>
                  <motion.div
                    className="mt-6 h-1.5 w-48 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-cyan-500"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: '50%' }}
                    />
                  </motion.div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <ListSkeleton rows={3} />
                  <ListSkeleton rows={3} />
                </div>
              </motion.div>
            )}

            {!loading && !searched && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="dash-card rounded-2xl p-12 lg:p-16 flex flex-col items-center justify-center min-h-[480px] text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="h-20 w-20 text-primary-400/60" />
                </motion.div>
                <h2 className="font-display text-xl font-bold dash-text-primary mt-6">
                  Configure your perfect match
                </h2>
                <p className="dash-text-muted mt-2 max-w-md text-sm leading-relaxed">
                  Use the advanced form to set budget, profession, gaming, editing, AI workloads,
                  software stack, and intensity. Results appear with compatibility scores, AI
                  explanations, future-proof ratings, and performance charts.
                </p>
              </motion.div>
            )}

            {!loading && searched && results.length === 0 && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="dash-card rounded-2xl p-12 text-center"
              >
                <p className="dash-text-primary font-medium">No matches found</p>
                <p className="text-sm dash-text-muted mt-2">
                  Try widening your budget or lowering RAM/storage requirements.
                </p>
              </motion.div>
            )}

            {!loading && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider">
                      Results ready
                    </p>
                    <h2 className="font-display text-2xl font-bold dash-text-primary">
                      Top {results.length} AI-ranked laptops
                    </h2>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="rounded-full bg-emerald-500/15 text-emerald-500 px-4 py-1.5 text-sm font-semibold"
                  >
                    Analysis complete
                  </motion.span>
                </motion.div>

                <motion.div layout className="grid sm:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {results.map((r, i) => (
                      <RecommendationResultCard
                        key={r.laptop.id}
                        result={r}
                        rank={i + 1}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
