import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Sparkles,
  Scale,
  Laptop,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Home,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

const bottomDockItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recommend', icon: Sparkles, label: 'AI Match' },
  { to: '/compare', icon: Scale, label: 'Compare' },
  { to: '/browse', icon: Laptop, label: 'Catalog' },
  { to: '/analytics', icon: BarChart3, label: 'Stats' },
]

export function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Telemetry Hub'
    if (path.includes('/recommend')) return 'AI Engine'
    if (path.includes('/compare')) return 'Spec Matrix'
    if (path.includes('/browse')) return 'Catalog'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/profile')) return 'Profile'
    if (path.includes('/laptops')) return 'Specs View'
    return 'FINDtech'
  }

  return (
    <>
      {/* Top Mobile Header (Screen < lg) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-inherit dash-card flex items-center justify-between px-4 backdrop-blur-2xl">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-primary-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-bold gradient-text">FINDtech</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/10 mx-1" />
          <span className="font-mono text-[11px] font-semibold tracking-tight text-primary-500 uppercase flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {getPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl dash-text-muted hover:dash-text-primary hover:bg-primary-500/10 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl dash-text-muted hover:dash-text-primary hover:bg-primary-500/10 transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Floating Bottom Dock (Screen < lg) */}
      <div className="lg:hidden fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none">
        <nav className="mx-auto max-w-md pointer-events-auto rounded-2xl bg-slate-900/90 dark:bg-[#0c1222]/90 border border-white/15 dark:border-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl p-1.5 flex items-center justify-around">
          {bottomDockItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDockIndicator"
                    className="absolute inset-0 bg-primary-600/30 rounded-xl border border-primary-500/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn('h-5 w-5 shrink-0 transition-transform', isActive && 'scale-110 text-cyan-400')} />
                <span className="text-[10px] font-semibold mt-1 tracking-tight">{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Slide-Over Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] dash-sidebar p-6 flex flex-col shadow-2xl border-l border-inherit"
            >
              <div className="flex items-center justify-between pb-6 border-b border-inherit">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold dash-text-primary text-base">FINDtech</h2>
                    <p className="font-mono text-[10px] text-primary-400">ML ENGINE v2.6</p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl dash-text-muted hover:dash-text-primary hover:bg-primary-500/10"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User badge */}
              {user && (
                <div className="my-6 p-4 rounded-2xl dash-card flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 via-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm dash-text-primary truncate">{user.full_name}</p>
                    <p className="text-xs dash-text-muted truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                <NavLink
                  to="/"
                  end
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                      isActive ? 'dash-nav-active' : 'dash-nav-item'
                    )
                  }
                >
                  <Home className="h-5 w-5 shrink-0" />
                  <span>Landing Page</span>
                </NavLink>

                {bottomDockItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                        isActive ? 'dash-nav-active' : 'dash-nav-item'
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}

                <NavLink
                  to="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all',
                      isActive ? 'dash-nav-active' : 'dash-nav-item'
                    )
                  }
                >
                  <User className="h-5 w-5 shrink-0" />
                  <span>Profile & Preferences</span>
                </NavLink>
              </nav>

              {/* Footer Actions */}
              <div className="pt-6 border-t border-inherit space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-xs dash-text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Encrypted JWT Session</span>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
