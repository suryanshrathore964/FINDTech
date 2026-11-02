import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown, Sparkles, RefreshCw } from 'lucide-react'
import { AnimatedChartCard } from './AnimatedChartCard'
import { Button } from '@/components/ui/Button'

interface AIReasoningPanelProps {
  insight: string
  onRefresh?: () => void
  delay?: number
}

export function AIReasoningPanel({ insight, onRefresh, delay = 0 }: AIReasoningPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const sentences = insight.split(/(?<=\.)\s+/).filter(Boolean)

  return (
    <AnimatedChartCard
      title="AI-generated insights"
      subtitle="Reasoning from catalog & your recommendation patterns"
      icon={<Brain className="h-5 w-5" />}
      delay={delay}
      action={
        onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )
      }
    >
      <div className="relative rounded-xl border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-transparent to-cyan-500/5 p-5 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative flex items-start gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
          </motion.div>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {expanded ? (
                <motion.div
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {sentences.map((s, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="text-sm dash-text-muted leading-relaxed"
                    >
                      {s}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <motion.p
                  key="short"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm dash-text-muted line-clamp-2"
                >
                  {sentences[0]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-400 mx-auto"
      >
        {expanded ? 'Show less' : 'Read full analysis'}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </AnimatedChartCard>
  )
}
