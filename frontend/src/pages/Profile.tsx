import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Sparkles, Shield, Bell, Palette } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export function Profile() {
  const { user } = useAuth()
  const { theme, setTheme, isDark } = useTheme()

  const infoItems = [
    { icon: User, label: 'Full name', value: user?.full_name, color: 'text-primary-500' },
    { icon: Mail, label: 'Email', value: user?.email, color: 'text-cyan-500' },
    ...(user?.created_at
      ? [
          {
            icon: Calendar,
            label: 'Member since',
            value: new Date(user.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            color: 'text-amber-500',
          },
        ]
      : []),
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <DashboardHeader title="Profile" subtitle="Manage your account and preferences" />

      <div className="grid lg:grid-cols-3 gap-6">
        <DashboardCard delay={0} className="lg:col-span-1 p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto h-24 w-24 rounded-2xl bg-gradient-to-br from-primary-500 via-cyan-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary-500/25"
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </motion.div>
          <h2 className="font-display text-xl font-bold dash-text-primary mt-6">{user?.full_name}</h2>
          <p className="dash-text-muted text-sm mt-1">FINDtech member</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </div>
          <Link
            to="/recommend"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-400"
          >
            <Sparkles className="h-4 w-4" />
            Run recommendation
          </Link>
        </DashboardCard>

        <div className="lg:col-span-2 space-y-6">
          <DashboardCard delay={0.1} className="p-6">
            <h3 className="font-display font-semibold dash-text-primary mb-4">Account details</h3>
            <div className="space-y-3">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-primary-500/10 hover:bg-primary-500/5 transition-all"
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', item.color)} />
                  <div>
                    <p className="text-xs dash-text-muted">{item.label}</p>
                    <p className="font-medium dash-text-primary">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard delay={0.15} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-violet-500" />
              <h3 className="font-display font-semibold dash-text-primary">Appearance</h3>
            </div>
            <p className="text-sm dash-text-muted mb-4">Choose your preferred dashboard theme</p>
            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all capitalize',
                    theme === t
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-transparent dash-card hover:border-primary-500/20'
                  )}
                >
                  <span className="font-semibold dash-text-primary">{t} mode</span>
                  <p className="text-xs dash-text-muted mt-1">
                    {t === 'light' ? 'Clean & bright' : 'Futuristic dark'}
                  </p>
                </button>
              ))}
            </div>
            <p className="text-xs dash-text-muted mt-3">
              Currently using <strong>{isDark ? 'dark' : 'light'}</strong> theme
            </p>
          </DashboardCard>

          <DashboardCard delay={0.2} className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary-500" />
              <h3 className="font-display font-semibold dash-text-primary">Preferences</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Email notifications', desc: 'New matches & catalog updates', enabled: true },
                { label: 'AI insights', desc: 'Weekly compatibility reports', enabled: true },
                { label: 'Marketing', desc: 'Product news and offers', enabled: false },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-primary-500/5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium dash-text-primary">{pref.label}</p>
                    <p className="text-xs dash-text-muted">{pref.desc}</p>
                  </div>
                  <div
                    className={cn(
                      'h-6 w-11 rounded-full relative transition-colors',
                      pref.enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-white/10'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all',
                        pref.enabled ? 'left-6' : 'left-1'
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard delay={0.25} className="p-6 flex items-center gap-4">
            <Shield className="h-8 w-8 text-emerald-500 shrink-0" />
            <div>
              <p className="font-medium dash-text-primary">Secure account</p>
              <p className="text-sm dash-text-muted">
                Your data is encrypted. JWT authentication protects all API requests.
              </p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
