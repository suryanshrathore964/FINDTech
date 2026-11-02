import { motion } from 'framer-motion'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { cn } from '@/lib/utils'

interface AnimatedChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  delay?: number
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function AnimatedChartCard({
  title,
  subtitle,
  children,
  className,
  delay = 0,
  icon,
  action,
}: AnimatedChartCardProps) {
  return (
    <DashboardCard delay={delay} hover={false} className={cn('p-6', className)}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: delay + 0.1 }}
        className="flex items-start justify-between gap-4 mb-6"
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-500">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold dash-text-primary">{title}</h3>
            {subtitle && <p className="text-sm dash-text-muted mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.5 }}
      >
        {children}
      </motion.div>
    </DashboardCard>
  )
}
