import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartBox } from '@/components/ui/ChartBox'
import { useTheme } from '@/context/ThemeContext'
import { DashboardCard } from './DashboardCard'

const CHART_HEIGHT = 200

interface ActivityChartProps {
  data: { day: string; recommendations: number }[]
  delay?: number
}

export function ActivityChart({ data, delay = 0 }: ActivityChartProps) {
  const { isDark } = useTheme()
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark ? '#94a3b8' : '#64748b'

  return (
    <DashboardCard delay={delay} className="p-6" hover={false}>
      <div className="mb-6">
        <h3 className="font-display font-semibold dash-text-primary">Weekly activity</h3>
        <p className="text-sm dash-text-muted mt-0.5">Recommendation sessions</p>
      </div>
      <ChartBox height={CHART_HEIGHT}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)' }}
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                borderRadius: '12px',
              }}
              formatter={(value) => [value ?? 0, 'Sessions']}
            />
            <Bar dataKey="recommendations" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>
    </DashboardCard>
  )
}
