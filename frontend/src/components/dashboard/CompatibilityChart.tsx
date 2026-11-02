import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartBox } from '@/components/ui/ChartBox'
import { useTheme } from '@/context/ThemeContext'
import { DashboardCard } from './DashboardCard'

const CHART_HEIGHT = 200

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

interface CompatibilityChartProps {
  data: { name: string; value: number }[]
  delay?: number
}

export function CompatibilityChart({ data, delay = 0 }: CompatibilityChartProps) {
  const { isDark } = useTheme()

  return (
    <DashboardCard delay={delay} className="p-6" hover={false}>
      <div className="mb-4">
        <h3 className="font-display font-semibold dash-text-primary">Use-case compatibility</h3>
        <p className="text-sm dash-text-muted mt-0.5">Catalog distribution by workflow</p>
      </div>
      <ChartBox height={CHART_HEIGHT}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                borderRadius: '12px',
              }}
              formatter={(value, name) => [`${value ?? 0}%`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartBox>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="dash-text-muted truncate capitalize">{item.name}</span>
            <span className="dash-text-primary font-semibold ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
