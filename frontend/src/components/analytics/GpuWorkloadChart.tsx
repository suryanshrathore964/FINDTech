import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Cpu } from 'lucide-react'
import { ChartBox } from '@/components/ui/ChartBox'
import { AnimatedChartCard } from './AnimatedChartCard'
import { useChartTheme, chartTooltipStyle } from './useChartTheme'
import type { GpuWorkloadItem } from '@/types/analytics'

interface GpuWorkloadChartProps {
  data: GpuWorkloadItem[]
  delay?: number
}

export function GpuWorkloadChart({ data, delay = 0 }: GpuWorkloadChartProps) {
  const { grid, text, isDark, primary, cyan, violet } = useChartTheme()

  return (
    <AnimatedChartCard
      title="GPU workload analysis"
      subtitle="AI/ML, gaming & creative suitability by GPU"
      icon={<Cpu className="h-5 w-5" />}
      delay={delay}
      className="lg:col-span-2"
    >
      <ChartBox height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: -16, right: 8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: text, fontSize: 9 }}
              angle={-20}
              textAnchor="end"
              height={56}
              axisLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fill: text, fontSize: 10 }} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle(isDark)} />
            <Legend wrapperStyle={{ fontSize: 11, color: text }} />
            <Bar dataKey="aiScore" name="AI/ML" fill={primary} radius={[4, 4, 0, 0]} animationDuration={1200} />
            <Bar dataKey="gamingScore" name="Gaming" fill={cyan} radius={[4, 4, 0, 0]} animationDuration={1200} />
            <Bar dataKey="creativeScore" name="Creative" fill={violet} radius={[4, 4, 0, 0]} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <p className="text-xs dash-text-muted mt-2 text-center">
        Grouped bars show workload fit per laptop · Tier derived from GPU model string
      </p>
    </AnimatedChartCard>
  )
}
