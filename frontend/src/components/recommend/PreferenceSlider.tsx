import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PreferenceSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  color?: 'blue' | 'cyan' | 'violet'
}

const trackColors = {
  blue: 'from-primary-400 to-primary-600',
  cyan: 'from-cyan-400 to-cyan-600',
  violet: 'from-violet-400 to-violet-600',
}

export function PreferenceSlider({
  label,
  value,
  onChange,
  hint,
  color = 'blue',
}: PreferenceSliderProps) {
  const pct = ((value - 1) / 9) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium dash-text-primary">{label}</label>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold text-primary-500"
        >
          {value}/10
        </motion.span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={cn('absolute left-0 top-0 h-full rounded-full bg-gradient-to-r', trackColors[color])}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="recommend-range w-full -mt-2 relative z-10"
      />
      {hint && <p className="text-xs dash-text-muted">{hint}</p>}
    </div>
  )
}
