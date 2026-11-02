import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  strong?: boolean
}

export function GlassPanel({ children, className, strong }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl transition-colors duration-200 border',
        strong
          ? 'bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border-slate-200/90 dark:border-white/10 shadow-xl shadow-primary-500/5'
          : 'bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border-slate-200/70 dark:border-white/[0.08] shadow-lg shadow-primary-500/5',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
