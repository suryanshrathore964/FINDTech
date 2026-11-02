import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Sparkles,
  Laptop,
  User,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  BarChart3,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/recommend', icon: Sparkles, label: 'AI Recommend' },
  { to: '/compare', icon: Scale, label: 'Compare' },
  { to: '/browse', icon: Laptop, label: 'Browse' },
  { to: '/profile', icon: User, label: 'Profile' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.aside
      layout
      className={cn(
        'fixed left-0 top-0 z-40 hidden lg:flex h-screen flex-col dash-sidebar transition-colors duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-inherit">
        {!collapsed && (
          <NavLink to="/" className="font-display text-xl font-bold gradient-text">
            FINDtech
          </NavLink>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 dash-text-muted hover:bg-primary-500/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isActive ? 'dash-nav-active' : 'dash-nav-item'
            )
          }
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Home</span>}
        </NavLink>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive ? 'dash-nav-active' : 'dash-nav-item'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-inherit p-3 space-y-2">
        <button
          onClick={toggleTheme}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium dash-nav-item transition-all',
            isDark && 'text-amber-400'
          )}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {!collapsed && user && (
          <div className="rounded-xl px-3 py-2 dash-card">
            <p className="text-xs dash-text-muted">Signed in as</p>
            <p className="text-sm font-medium dash-text-primary truncate">{user.full_name}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </motion.aside>
  )
}
