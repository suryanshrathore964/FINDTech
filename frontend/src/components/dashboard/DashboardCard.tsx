import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  glow?: boolean
}

export function DashboardCard({
  children,
  className,
  delay = 0,
  hover = true,
  glow = false,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={cn(
        'dash-card rounded-2xl transition-shadow duration-300',
        hover && 'hover:shadow-xl',
        glow && 'ring-1 ring-primary-500/20',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
