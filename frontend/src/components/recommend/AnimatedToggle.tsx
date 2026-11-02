import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedToggleProps {
  enabled: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon?: React.ReactNode
}

export function AnimatedToggle({
  enabled,
  onChange,
  label,
  description,
  icon,
}: AnimatedToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-300',
        enabled
          ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10'
          : 'border-transparent dash-card hover:border-primary-500/20'
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
            enabled ? 'bg-primary-500 text-white' : 'bg-slate-200/50 dark:bg-white/5 dash-text-muted'
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium dash-text-primary text-sm">{label}</p>
        {description && <p className="text-xs dash-text-muted mt-0.5">{description}</p>}
      </div>
      <div
        className={cn(
          'relative h-7 w-12 rounded-full transition-colors shrink-0',
          enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-white/10'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
          style={{ left: enabled ? 26 : 4 }}
        />
      </div>
    </button>
  )
}
