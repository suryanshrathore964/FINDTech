import { useTheme } from '@/context/ThemeContext'

export function useChartTheme() {
  const { isDark } = useTheme()
  return {
    isDark,
    grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    primary: '#3b82f6',
    cyan: '#06b6d4',
    violet: '#8b5cf6',
    mint: '#10b981',
    amber: '#f59e0b',
  }
}

export function chartTooltipStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    color: isDark ? '#f8fafc' : '#0f172a',
  }
}
