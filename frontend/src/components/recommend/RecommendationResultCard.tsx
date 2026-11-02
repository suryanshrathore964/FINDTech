import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Shield, Sparkles, ArrowRight, Cpu } from 'lucide-react'
import { PerformanceChart } from './PerformanceChart'
import { LaptopImage } from '@/components/ui/LaptopImage'
import { formatPrice } from '@/lib/utils'
import type { EnrichedRecommendation } from '@/types/recommend'

interface RecommendationResultCardProps {
  result: EnrichedRecommendation
  rank: number
  index: number
}

export function RecommendationResultCard({
  result,
  rank,
  index,
}: RecommendationResultCardProps) {
  const { laptop, compatibilityScore, futureProofScore, aiExplanation, performance } = result

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="dash-card rounded-2xl overflow-hidden group hover:ring-2 hover:ring-primary-500/25 transition-all"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary-500/10 to-cyan-500/10">
        <motion.div
          className="h-full w-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        >
          <LaptopImage
            imageUrl={laptop.image_url}
            laptopId={laptop.id}
            alt={laptop.name}
            className="h-full w-full"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white shadow-lg">
            #{rank}
          </span>
          <span className="rounded-lg bg-white/90 dark:bg-black/50 backdrop-blur px-3 py-1 text-sm font-bold text-primary-600 dark:text-primary-300">
            {compatibilityScore}% match
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs font-medium text-white/80 uppercase tracking-wider">{laptop.brand}</p>
          <h3 className="font-display text-lg font-bold text-white line-clamp-1">{laptop.name}</h3>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-500">{formatPrice(laptop.price)}</span>
          <span className="inline-flex items-center gap-1 text-sm text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            {laptop.rating.toFixed(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ScoreRing
            label="Compatibility"
            score={compatibilityScore}
            color="primary"
            icon={<Sparkles className="h-4 w-4" />}
          />
          <ScoreRing
            label="Future-proof"
            score={futureProofScore}
            color="cyan"
            icon={<Shield className="h-4 w-4" />}
          />
        </div>

        <div className="rounded-xl bg-primary-500/5 border border-primary-500/10 p-4">
          <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" />
            AI explanation
          </p>
          <p className="text-sm dash-text-muted leading-relaxed">{aiExplanation}</p>
        </div>

        <div>
          <p className="text-xs font-semibold dash-text-muted uppercase tracking-wider mb-2">
            Performance profile
          </p>
          <PerformanceChart data={performance} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {laptop.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 text-xs font-medium dash-text-muted capitalize"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          to={`/laptops/${laptop.id}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:bg-primary-500/20 transition-colors group/btn"
        >
          View full specs
          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  )
}

function ScoreRing({
  label,
  score,
  color,
  icon,
}: {
  label: string
  score: number
  color: 'primary' | 'cyan'
  icon: React.ReactNode
}) {
  const stroke = color === 'primary' ? '#3b82f6' : '#06b6d4'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl dash-card">
      <div className="relative h-16 w-16 shrink-0">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold dash-text-primary">
          {score}
        </span>
      </div>
      <div>
        <p className="text-xs dash-text-muted flex items-center gap-1">{icon} {label}</p>
        <p className="text-lg font-bold dash-text-primary">{score}%</p>
      </div>
    </div>
  )
}
