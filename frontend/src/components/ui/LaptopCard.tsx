import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cpu, HardDrive, Battery, Star, Scale } from 'lucide-react'
import { Badge } from './Badge'
import { LaptopImage } from '@/components/ui/LaptopImage'
import { formatPrice } from '@/lib/utils'
import type { Laptop, RecommendationResult } from '@/types'

interface LaptopCardProps {
  laptop: Laptop
  matchScore?: number
  reasons?: string[]
  index?: number
  onCompareToggle?: (laptop: Laptop) => void
  isComparing?: boolean
}

export function LaptopCard({
  laptop,
  matchScore,
  reasons,
  index = 0,
  onCompareToggle,
  isComparing = false,
}: LaptopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative flex flex-col"
    >
      <div className="dash-card rounded-2xl overflow-hidden p-5 flex flex-col h-full border border-primary-500/10 hover:border-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5">
        <Link to={`/laptops/${laptop.id}`} className="block relative mb-4 aspect-[16/10] overflow-hidden rounded-xl bg-slate-900/40">
          <LaptopImage
            imageUrl={laptop.image_url}
            laptopId={laptop.id}
            alt={laptop.name}
            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {matchScore !== undefined && (
            <div className="absolute top-3 right-3 rounded-full bg-primary-600/90 text-white px-3 py-1 text-xs font-bold shadow-md backdrop-blur-sm">
              {Math.round(matchScore * 100)}% match
            </div>
          )}
        </Link>

        <div className="flex-1 flex flex-col space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              {laptop.brand}
            </p>
            <Link to={`/laptops/${laptop.id}`}>
              <h3 className="font-display text-base font-bold dash-text-primary group-hover:text-primary-500 transition-colors line-clamp-2 mt-0.5">
                {laptop.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium dash-text-muted">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {laptop.rating.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-primary-500 ml-auto">
              {formatPrice(laptop.price)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs dash-text-muted py-2 border-t border-inherit">
            <span className="flex items-center gap-1 truncate" title={`RAM: ${laptop.ram_gb}GB`}>
              <Cpu className="h-3 w-3 text-primary-400 shrink-0" /> {laptop.ram_gb}GB
            </span>
            <span className="flex items-center gap-1 truncate" title={`Storage: ${laptop.storage_gb >= 1024 ? `${laptop.storage_gb / 1024}TB` : `${laptop.storage_gb}GB`}`}>
              <HardDrive className="h-3 w-3 text-cyan-400 shrink-0" /> {laptop.storage_gb >= 1024 ? `${laptop.storage_gb / 1024}TB` : `${laptop.storage_gb}GB`}
            </span>
            <span className="flex items-center gap-1 truncate" title={`Battery: ${laptop.battery_hours}h`}>
              <Battery className="h-3 w-3 text-emerald-400 shrink-0" /> {laptop.battery_hours}h
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {laptop.use_cases.slice(0, 2).map((uc) => (
              <Badge key={uc} variant="blue">
                {uc}
              </Badge>
            ))}
            {laptop.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="mint">
                {tag}
              </Badge>
            ))}
          </div>

          {reasons && reasons.length > 0 && (
            <ul className="text-xs dash-text-muted space-y-1 border-t border-inherit pt-2.5">
              {reasons.slice(0, 2).map((r) => (
                <li key={r} className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span className="line-clamp-1">{r}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Quick Actions */}
          <div className="mt-auto pt-3 flex items-center gap-2 border-t border-inherit">
            <Link
              to={`/laptops/${laptop.id}`}
              className="flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 transition-colors"
            >
              Specs
            </Link>
            {onCompareToggle ? (
              <button
                type="button"
                onClick={() => onCompareToggle(laptop)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  isComparing
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-200/60 dark:bg-white/10 dash-text-primary hover:bg-primary-500/10'
                }`}
                title="Add to side-by-side comparison"
              >
                <Scale className="h-3 w-3" />
                {isComparing ? 'Comparing' : 'Compare'}
              </button>
            ) : (
              <Link
                to={`/compare?ids=${laptop.id}`}
                className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
                title="Compare with others"
              >
                <Scale className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RecommendationCard({ result, index }: { result: RecommendationResult; index: number }) {
  return (
    <LaptopCard
      laptop={result.laptop}
      matchScore={result.match_score}
      reasons={result.reasons}
      index={index}
    />
  )
}
