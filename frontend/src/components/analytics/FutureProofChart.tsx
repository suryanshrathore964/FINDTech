import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Shield } from 'lucide-react'
import { ChartBox } from '@/components/ui/ChartBox'
import { AnimatedChartCard } from './AnimatedChartCard'
import { useChartTheme, chartTooltipStyle } from './useChartTheme'
import type { FutureProofItem } from '@/types/analytics'

function scoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#3b82f6'
  if (score >= 55) return '#8b5cf6'
  return '#94a3b8'
}

interface FutureProofChartProps {
  data: FutureProofItem[]
  delay?: number
}

export function FutureProofChart({ data, delay = 0 }: FutureProofChartProps) {
  const { grid, text, isDark } = useChartTheme()

  return (
    <AnimatedChartCard
      title="Future-proof analysis"
      subtitle="Longevity score from RAM, storage & GPU tier"
      icon={<Shield className="h-5 w-5" />}
      delay={delay}
    >
      <ChartBox height={240}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: -16, right: 8, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: text, fontSize: 9 }}
              angle={-25}
              textAnchor="end"
              height={50}
              axisLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fill: text, fontSize: 10 }} tickFormatter={(v) => `${v}%`} axisLine={false} />
            <Tooltip
              contentStyle={chartTooltipStyle(isDark)}
              formatter={(value) => {
                const v = Number(value ?? 0)
                return [`${v}%`, 'Future-proof']
              }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={1400}>
              {data.map((d) => (
                <Cell key={d.name} fill={scoreColor(d.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { label: '5+ years', color: '#10b981', min: 85 },
          { label: '3–4 years', color: '#3b82f6', min: 70 },
          { label: '1–2 years', color: '#94a3b8', min: 0 },
        ].map((l) => (
          <div key={l.label} className="flex items-center justify-center gap-1.5 dash-text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </AnimatedChartCard>
  )
}
