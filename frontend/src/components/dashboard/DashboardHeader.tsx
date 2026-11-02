import { motion } from 'framer-motion'
import { Moon, Sun, Bell } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, action }: DashboardHeaderProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold dash-text-primary">{title}</h1>
        {subtitle && <p className="dash-text-muted mt-1 text-sm lg:text-base">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button
          className="dash-card p-2.5 rounded-xl dash-text-muted hover:text-primary-500 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTheme}
          className={cn(
            'dash-card p-2.5 rounded-xl transition-all',
            isDark ? 'text-amber-400 hover:text-amber-300' : 'text-primary-600 hover:text-primary-700'
          )}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </motion.div>
  )
}
