import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Target } from 'lucide-react'
import { ChartBox } from '@/components/ui/ChartBox'
import { AnimatedChartCard } from './AnimatedChartCard'
import { useChartTheme, chartTooltipStyle } from './useChartTheme'
import type { CompatibilityBand } from '@/types/analytics'

interface CompatibilityScoreVizProps {
  bands: CompatibilityBand[]
  topScore: number
  delay?: number
}

export function CompatibilityScoreViz({ bands, topScore, delay = 0 }: CompatibilityScoreVizProps) {
  const { grid, text, isDark } = useChartTheme()
  const total = bands.reduce((s, b) => s + b.count, 0) || 1

  return (
    <AnimatedChartCard
      title="Compatibility scoring"
      subtitle="Estimated match distribution across catalog"
      icon={<Target className="h-5 w-5" />}
      delay={delay}
      action={
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring' }}
          className="text-right"
        >
          <p className="text-2xl font-bold text-primary-500">{topScore}%</p>
          <p className="text-xs dash-text-muted">peak score</p>
        </motion.div>
      }
    >
      <ChartBox height={200} className="mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bands} layout="vertical" margin={{ left: 20, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: text, fontSize: 10 }} axisLine={false} />
            <YAxis type="category" dataKey="range" tick={{ fill: text, fontSize: 11 }} width={72} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle(isDark)} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={1200}>
              {bands.map((b) => (
                <Cell key={b.range} fill={b.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <div className="flex flex-wrap gap-2">
        {bands.map((b, i) => (
          <motion.div
            key={b.range}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.15 + i * 0.05 }}
            className="flex-1 min-w-[100px] rounded-xl p-3 dash-card text-center"
          >
            <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: b.fill }} />
            <p className="text-lg font-bold dash-text-primary">{Math.round((b.count / total) * 100)}%</p>
            <p className="text-xs dash-text-muted">{b.range}</p>
          </motion.div>
        ))}
      </div>
    </AnimatedChartCard>
  )
}
