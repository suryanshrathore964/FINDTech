import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const SOFTWARE_OPTIONS = [
  'VS Code',
  'Docker',
  'Adobe CC',
  'Figma',
  'Blender',
  'Unity',
  'Unreal Engine',
  'MATLAB',
  'PyTorch',
  'Premiere Pro',
  'DaVinci Resolve',
  'AutoCAD',
  'Slack',
  'Chrome',
]

interface SoftwareStackSelectProps {
  selected: string[]
  onChange: (v: string[]) => void
}

export function SoftwareStackSelect({ selected, onChange }: SoftwareStackSelectProps) {
  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item))
    } else {
      onChange([...selected, item])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SOFTWARE_OPTIONS.map((item) => {
        const active = selected.includes(item)
        return (
          <motion.button
            key={item}
            type="button"
            onClick={() => toggle(item)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
              active
                ? 'border-primary-500 bg-primary-500/20 text-primary-600 dark:text-primary-300'
                : 'border-transparent dash-card dash-text-muted hover:border-primary-500/30'
            )}
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-3 w-3" />
                </motion.span>
              )}
            </AnimatePresence>
            {item}
          </motion.button>
        )
      })}
    </div>
  )
}
