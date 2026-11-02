import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { History, Sparkles, Clock } from 'lucide-react'
import { DashboardCard } from './DashboardCard'

interface HistoryItem {
  id: string
  created_at: string
  count: number
}

interface RecommendationHistoryProps {
  items: HistoryItem[]
  delay?: number
}

export function RecommendationHistory({ items, delay = 0 }: RecommendationHistoryProps) {
  return (
    <DashboardCard delay={delay} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-violet-500" />
          <h3 className="font-display font-semibold dash-text-primary">Recommendation history</h3>
        </div>
        <Link
          to="/recommend"
          className="text-sm font-medium text-primary-500 hover:text-primary-400"
        >
          New session
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10">
          <Sparkles className="h-10 w-10 text-primary-400/50 mx-auto mb-3" />
          <p className="dash-text-muted text-sm">No sessions yet</p>
          <Link
            to="/recommend"
            className="inline-block mt-3 text-sm font-semibold text-primary-500 hover:text-primary-400"
          >
            Run your first recommendation →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-primary-500/15 hover:bg-primary-500/5 transition-all group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dash-text-primary">
                  {item.count} matches found
                </p>
                <p className="text-xs dash-text-muted flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {new Date(item.created_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500">
                Complete
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}
