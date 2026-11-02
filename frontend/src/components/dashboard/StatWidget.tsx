import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { DashboardCard } from './DashboardCard'
import { cn } from '@/lib/utils'

interface StatWidgetProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  gradient?: string
  delay?: number
}

export function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = 'from-primary-500 to-cyan-500',
  delay = 0,
}: StatWidgetProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <DashboardCard delay={delay} className="p-6">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
            gradient
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              isPositive
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-red-500/15 text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <motion.p
        className="font-display text-3xl font-bold dash-text-primary mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {value}
      </motion.p>
      <p className="text-sm font-medium dash-text-muted mt-1">{title}</p>
      {subtitle && <p className="text-xs dash-text-muted mt-0.5 opacity-80">{subtitle}</p>}
      {trend && (
        <p className="text-xs dash-text-muted mt-2">{trend.label}</p>
      )}
    </DashboardCard>
  )
}
