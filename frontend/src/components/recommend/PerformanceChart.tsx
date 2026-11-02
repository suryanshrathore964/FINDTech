import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { ChartBox } from '@/components/ui/ChartBox'
import { useTheme } from '@/context/ThemeContext'
import type { PerformanceBreakdown } from '@/types/recommend'

interface PerformanceChartProps {
  data: PerformanceBreakdown
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const { isDark } = useTheme()
  const chartData = [
    { metric: 'CPU', value: data.cpu },
    { metric: 'GPU', value: data.gpu },
    { metric: 'RAM', value: data.ram },
    { metric: 'Battery', value: data.battery },
    { metric: 'Storage', value: data.storage },
    { metric: 'Portable', value: data.portability },
  ]
  const tickColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <ChartBox height={160}>
      <ResponsiveContainer width="100%" height={160}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: tickColor, fontSize: 10 }} />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartBox>
  )
}
