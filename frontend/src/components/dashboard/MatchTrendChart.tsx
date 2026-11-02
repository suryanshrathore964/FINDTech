import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartBox } from '@/components/ui/ChartBox'
import { useTheme } from '@/context/ThemeContext'
import { DashboardCard } from './DashboardCard'

const CHART_HEIGHT = 240

interface MatchTrendChartProps {
  data: { month: string; score: number; sessions: number }[]
  delay?: number
}

export function MatchTrendChart({ data, delay = 0 }: MatchTrendChartProps) {
  const { isDark } = useTheme()
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <DashboardCard delay={delay} className="p-6" hover={false}>
      <div className="mb-6">
        <h3 className="font-display font-semibold dash-text-primary">Match score trend</h3>
        <p className="text-sm dash-text-muted mt-0.5">Average compatibility over time</p>
      </div>
      <ChartBox height={CHART_HEIGHT}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[60, 100]}
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
              labelStyle={{ color: textColor }}
              formatter={(value) => [`${value ?? 0}%`, 'Match score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartBox>
    </DashboardCard>
  )
}
