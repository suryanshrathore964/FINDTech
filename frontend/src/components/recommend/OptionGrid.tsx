import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface OptionItem<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface OptionGridProps<T extends string> {
  options: OptionItem<T>[]
  value: T
  onChange: (v: T) => void
  columns?: 2 | 3 | 4
  groupId?: string
}

export function OptionGrid<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
  groupId = 'default',
}: OptionGridProps<T>) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns]

  return (
    <div className={cn('grid gap-2', colClass)}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-colors',
              active
                ? 'border-primary-500 bg-primary-500/15 text-primary-600 dark:text-primary-300'
                : 'border-transparent dash-card dash-text-muted hover:border-primary-500/25'
            )}
          >
            {active && (
              <motion.div
                layoutId={`option-${groupId}`}
                className="absolute inset-0 rounded-xl ring-2 ring-primary-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {opt.icon && <span className="relative z-10">{opt.icon}</span>}
            <span className="relative z-10 text-xs font-semibold">{opt.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
