import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { ChartBox } from '@/components/ui/ChartBox'
import { AnimatedChartCard } from './AnimatedChartCard'
import { useChartTheme, chartTooltipStyle } from './useChartTheme'
import type { TrendPoint } from '@/types/analytics'

interface RecommendationTrendChartProps {
  data: TrendPoint[]
  delay?: number
}

export function RecommendationTrendChart({ data, delay = 0 }: RecommendationTrendChartProps) {
  const { grid, text, isDark, primary, cyan } = useChartTheme()

  return (
    <AnimatedChartCard
      title="Recommendation trends"
      subtitle="Weekly match scores, sessions & price signals"
      icon={<TrendingUp className="h-5 w-5" />}
      delay={delay}
      className="lg:col-span-2"
    >
      <ChartBox height={280}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="trendMatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
            <XAxis dataKey="period" tick={{ fill: text, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              domain={[60, 100]}
              tick={{ fill: text, fontSize: 11 }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
            />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: text, fontSize: 11 }} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle(isDark)} />
            <Legend wrapperStyle={{ fontSize: 12, color: text }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="matchScore"
              name="Match %"
              stroke={primary}
              fill="url(#trendMatch)"
              strokeWidth={2}
              animationDuration={1500}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke={cyan}
              strokeWidth={2}
              dot={{ fill: cyan, r: 4 }}
              animationDuration={1500}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgPrice"
              name="Avg price ($)"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartBox>
    </AnimatedChartCard>
  )
}
