import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  floatRange?: number
  glow?: 'blue' | 'cyan' | 'violet'
}

const glowColors = {
  blue: 'shadow-primary-500/20 hover:shadow-primary-500/30',
  cyan: 'shadow-cyan-500/20 hover:shadow-cyan-500/30',
  violet: 'shadow-violet-500/20 hover:shadow-violet-500/30',
}

export function FloatingCard({
  children,
  className,
  delay = 0,
  floatRange = 12,
  glow = 'blue',
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      animate={{ opacity: 1, y: [0, -floatRange, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: { duration: 4 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 },
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        'glass-dark rounded-2xl p-6 transition-shadow duration-300',
        glowColors[glow],
        className
      )}
    >
      {children}
    </motion.div>
  )
}
