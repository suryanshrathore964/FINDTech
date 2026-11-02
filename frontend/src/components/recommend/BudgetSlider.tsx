import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface BudgetSliderProps {
  min: number
  max: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
}

const BUDGET_FLOOR = 400
const BUDGET_CEIL = 5000

export function BudgetSlider({ min, max, onMinChange, onMaxChange }: BudgetSliderProps) {
  const minPct = ((min - BUDGET_FLOOR) / (BUDGET_CEIL - BUDGET_FLOOR)) * 100
  const maxPct = ((max - BUDGET_FLOOR) / (BUDGET_CEIL - BUDGET_FLOOR)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium dash-text-primary flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary-500" />
          Budget range
        </span>
        <motion.span
          key={`${min}-${max}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold text-primary-500"
        >
          {formatPrice(min)} – {formatPrice(max)}
        </motion.span>
      </div>

      <div className="relative h-3 rounded-full bg-slate-200/80 dark:bg-white/10">
        <motion.div
          className="absolute h-full rounded-full bg-gradient-to-r from-primary-500 via-cyan-500 to-violet-500"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs dash-text-muted mb-1.5 block">Minimum</label>
          <input
            type="range"
            min={BUDGET_FLOOR}
            max={BUDGET_CEIL - 200}
            step={50}
            value={min}
            onChange={(e) => {
              const v = Number(e.target.value)
              onMinChange(v)
              if (v >= max) onMaxChange(v + 200)
            }}
            className="recommend-range w-full"
          />
        </div>
        <div>
          <label className="text-xs dash-text-muted mb-1.5 block">Maximum</label>
          <input
            type="range"
            min={BUDGET_FLOOR + 200}
            max={BUDGET_CEIL}
            step={50}
            value={max}
            onChange={(e) => {
              const v = Number(e.target.value)
              onMaxChange(v)
              if (v <= min) onMinChange(v - 200)
            }}
            className="recommend-range w-full"
          />
        </div>
      </div>
    </div>
  )
}
