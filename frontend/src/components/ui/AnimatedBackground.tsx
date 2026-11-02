import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export function AnimatedBackground() {
  const { isDark } = useTheme()

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          isDark ? 'landing-grid opacity-25' : 'grid-pattern opacity-60'
        )}
      />
      <motion.div
        className={cn(
          'absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl transition-colors duration-500',
          isDark ? 'bg-primary-600/15' : 'bg-primary-300/20'
        )}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn(
          'absolute top-1/3 -left-32 h-80 w-80 rounded-full blur-3xl transition-colors duration-500',
          isDark ? 'bg-cyan-500/10' : 'bg-mint-300/15'
        )}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={cn(
          'absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl transition-colors duration-500',
          isDark ? 'bg-violet-500/10' : 'bg-sun-300/12'
        )}
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
