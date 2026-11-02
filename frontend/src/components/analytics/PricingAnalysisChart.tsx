import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { DollarSign } from 'lucide-react'
import { ChartBox } from '@/components/ui/ChartBox'
import { AnimatedChartCard } from './AnimatedChartCard'
import { useChartTheme, chartTooltipStyle } from './useChartTheme'
import { formatPrice } from '@/lib/utils'
import type { PricingPoint } from '@/types/analytics'

const BRAND_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1']

interface PricingAnalysisChartProps {
  byBrand: { brand: string; avgPrice: number; count: number }[]
  scatter: PricingPoint[]
  delay?: number
}

export function PricingAnalysisChart({ byBrand, scatter, delay = 0 }: PricingAnalysisChartProps) {
  const { grid, text, isDark } = useChartTheme()

  return (
    <AnimatedChartCard
      title="Pricing analysis"
      subtitle="Average price by brand & rating correlation"
      icon={<DollarSign className="h-5 w-5" />}
      delay={delay}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium dash-text-muted mb-2 uppercase tracking-wider">Avg price by brand</p>
          <ChartBox height={220}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byBrand} margin={{ left: -10, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="brand" tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: text, fontSize: 10 }} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={chartTooltipStyle(isDark)} formatter={(value) => [formatPrice(Number(value ?? 0)), 'Avg price']} />
                <Bar dataKey="avgPrice" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {byBrand.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
        <div>
          <p className="text-xs font-medium dash-text-muted mb-2 uppercase tracking-wider">Price vs rating</p>
          <ChartBox height={220}>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis type="number" dataKey="price" name="Price" tick={{ fill: text, fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis type="number" dataKey="rating" name="Rating" domain={[3.5, 5]} tick={{ fill: text, fontSize: 10 }} />
                <ZAxis range={[60, 200]} />
                <Tooltip
                  contentStyle={chartTooltipStyle(isDark)}
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => {
                    const v = Number(value ?? 0)
                    return [name === 'price' ? formatPrice(v) : v.toFixed(1), String(name)]
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
                />
                <Scatter data={scatter} fill="#3b82f6" animationDuration={1000}>
                  {scatter.map((_, i) => (
                    <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} fillOpacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>
      </div>
    </AnimatedChartCard>
  )
}
