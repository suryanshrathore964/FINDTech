import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Scale,
  Sparkles,
  Trophy,
  Trash2,
  Cpu,
  Monitor,
  HardDrive,
  Battery,
  Star,
  ArrowRight,
} from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LaptopImage } from '@/components/ui/LaptopImage'
import { formatPrice } from '@/lib/utils'
import { comparisonApi, laptopsApi } from '@/services/api'
import type { Laptop, ComparisonResponse } from '@/types'

export function Compare() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState('')

  // Load all laptops for the selection dropdown
  useEffect(() => {
    laptopsApi
      .list()
      .then(({ data }) => {
        setAllLaptops(data)
        const paramIds = searchParams.get('ids')?.split(',').filter(Boolean) || []
        if (paramIds.length >= 2) {
          setSelectedIds(paramIds.slice(0, 4))
        } else if (data.length >= 2) {
          // Default to top 2 laptops
          setSelectedIds([data[0].id, data[1].id])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Trigger comparison when selectedIds change
  useEffect(() => {
    if (selectedIds.length < 2) {
      setComparison(null)
      return
    }

    setComparing(true)
    setError('')
    comparisonApi
      .compare(selectedIds)
      .then(({ data }) => {
        setComparison(data)
        setSearchParams({ ids: selectedIds.join(',') }, { replace: true })
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to compare laptops')
      })
      .finally(() => setComparing(false))
  }, [selectedIds, setSearchParams])

  const addLaptop = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= 4) return
    setSelectedIds([...selectedIds, id])
  }

  const removeLaptop = (id: string) => {
    if (selectedIds.length <= 2) return
    setSelectedIds(selectedIds.filter((item) => item !== id))
  }

  const replaceLaptop = (oldId: string, newId: string) => {
    setSelectedIds(selectedIds.map((id) => (id === oldId ? newId : id)))
  }

  const availableToAdd = allLaptops.filter((l) => !selectedIds.includes(l.id))

  return (
    <div className="max-w-[1600px] mx-auto pb-24">
      <DashboardHeader
        title="Laptop Comparison Matrix"
        subtitle="Side-by-side spec intelligence, category winners & AI evaluation"
        action={
          <Link to="/recommend">
            <Button size="sm">
              <Sparkles className="h-4 w-4" />
              AI Match
            </Button>
          </Link>
        }
      />

      {/* Selector Bar */}
      <DashboardCard delay={0} className="p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold dash-text-primary">
                Comparing {selectedIds.length} of 4 Laptops
              </h3>
              <p className="text-xs dash-text-muted">
                Add or swap models to see instant category advantages
              </p>
            </div>
          </div>

          {selectedIds.length < 4 && availableToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addLaptop(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue=""
              >
                <option value="" disabled className="text-slate-400 bg-white dark:bg-slate-900">
                  + Add another laptop...
                </option>
                {availableToAdd.map((laptop) => (
                  <option key={laptop.id} value={laptop.id} className="text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900">
                    {laptop.brand} {laptop.name} (${laptop.price})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </DashboardCard>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {(loading || comparing) && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      )}

      {/* AI Summary Banner */}
      {!loading && !comparing && comparison && comparison.summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-primary-600/15 via-cyan-500/15 to-violet-600/15 border border-primary-500/20">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary-500/20 flex items-center justify-center shrink-0 text-primary-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-1">
                  AI Verdict & Summary
                </p>
                <p className="dash-text-primary font-medium text-base leading-relaxed">
                  {comparison.summary}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Winners Pills */}
      {comparison && comparison.winners && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider dash-text-muted mb-3">
            Category Leaders
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {comparison.winners.map((winner) => (
              <div
                key={winner.category}
                className="p-3.5 rounded-xl dash-card border border-primary-500/15"
              >
                <span className="text-xs font-semibold text-primary-500 uppercase">
                  {winner.category}
                </span>
                <p className="font-semibold text-sm dash-text-primary truncate mt-1">
                  {winner.winner_name}
                </p>
                <p className="text-xs dash-text-muted truncate mt-0.5">{winner.reason}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comparison Grid */}
      {comparison && comparison.laptops && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {comparison.laptops.map((laptop, index) => {
            const wins =
              comparison.winners.filter((w) => w.winner_id === laptop.id) || []

            return (
              <motion.div
                key={laptop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="dash-card rounded-2xl overflow-hidden flex flex-col border border-primary-500/10 hover:border-primary-500/30 transition-all"
              >
                {/* Header Image & Actions */}
                <div className="relative aspect-[16/10] bg-slate-900/50 p-4 flex items-center justify-center overflow-hidden">
                  <LaptopImage
                    imageUrl={laptop.image_url}
                    laptopId={laptop.id}
                    alt={laptop.name}
                    className="h-full w-full object-contain"
                  />
                  {selectedIds.length > 2 && (
                    <button
                      onClick={() => removeLaptop(laptop.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/80 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {wins.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-lg">
                      <Trophy className="h-3.5 w-3.5" />
                      {wins.length} Win{wins.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Model & Price */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
                      {laptop.brand}
                    </p>
                    <h3 className="font-display text-xl font-bold dash-text-primary mt-1 line-clamp-2">
                      {laptop.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl font-bold text-primary-500">
                        {formatPrice(laptop.price)}
                      </span>
                      <span className="flex items-center gap-1 text-sm dash-text-muted">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {laptop.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Spec List */}
                  <div className="space-y-3.5 py-4 border-t border-b border-inherit text-sm">
                    <div className="flex items-start gap-2.5">
                      <Cpu className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs dash-text-muted block">CPU</span>
                        <span className="font-medium dash-text-primary">{laptop.cpu}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Monitor className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs dash-text-muted block">GPU</span>
                        <span className="font-medium dash-text-primary">{laptop.gpu}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <HardDrive className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs dash-text-muted block">Memory & Storage</span>
                        <span className="font-medium dash-text-primary">
                          {laptop.ram_gb}GB RAM · {laptop.storage_gb}GB SSD
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Battery className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs dash-text-muted block">Battery & Weight</span>
                        <span className="font-medium dash-text-primary">
                          {laptop.battery_hours}h life · {laptop.weight_kg}kg
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Monitor className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs dash-text-muted block">Display</span>
                        <span className="font-medium dash-text-primary line-clamp-1">
                          {laptop.display}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pt-4 flex flex-wrap gap-1.5 mb-6">
                    {laptop.use_cases.map((uc) => (
                      <Badge key={uc} variant="blue">
                        {uc}
                      </Badge>
                    ))}
                    {laptop.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="mint">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Swap dropdown + view details button */}
                  <div className="mt-auto space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          replaceLaptop(laptop.id, e.target.value)
                        }
                      }}
                      className="w-full text-xs rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 py-2 px-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      defaultValue=""
                    >
                      <option value="" disabled className="text-slate-400 bg-white dark:bg-slate-900">
                        Swap with another laptop...
                      </option>
                      {availableToAdd.map((other) => (
                        <option key={other.id} value={other.id} className="text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900">
                          {other.brand} {other.name} (${other.price})
                        </option>
                      ))}
                    </select>

                    <Link to={`/laptops/${laptop.id}`} className="block">
                      <Button variant="secondary" size="sm" className="w-full text-xs">
                        View Full Specs
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
