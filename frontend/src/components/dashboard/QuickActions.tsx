import { Link } from 'react-router-dom'
import { Sparkles, Laptop, User, BarChart3, ArrowRight, Scale } from 'lucide-react'
import { DashboardCard } from './DashboardCard'

const actions = [
  {
    to: '/recommend',
    icon: Sparkles,
    title: 'AI Recommend',
    desc: 'Get personalized matches',
    gradient: 'from-primary-500 to-cyan-500',
  },
  {
    to: '/compare',
    icon: Scale,
    title: 'Compare Laptops',
    desc: 'Side-by-side spec matrix',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    to: '/analytics',
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Charts, GPU & AI insights',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    to: '/browse',
    icon: Laptop,
    title: 'Browse',
    desc: 'Explore full catalog',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    to: '/profile',
    icon: User,
    title: 'Profile',
    desc: 'Account settings',
    gradient: 'from-violet-500 to-purple-500',
  },
]

export function QuickActions({ delay = 0 }: { delay?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {actions.map((action, i) => (
        <DashboardCard key={action.to} delay={delay + i * 0.08} glow>
          <Link to={action.to} className="block p-5 group">
            <div
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg mb-4`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <h4 className="font-display font-semibold dash-text-primary group-hover:text-primary-500 transition-colors">
              {action.title}
            </h4>
            <p className="text-sm dash-text-muted mt-1">{action.desc}</p>
            <ArrowRight className="h-5 w-5 text-primary-500 mt-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </DashboardCard>
      ))}
    </div>
  )
}
