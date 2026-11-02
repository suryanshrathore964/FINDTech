import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { PageTransition } from './PageTransition'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon, Scale, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinkClass =
  'text-sm font-medium dash-text-muted hover:dash-text-primary hover:bg-primary-500/10 transition-colors px-3 py-2 rounded-xl'

export function PublicLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const onLoginPage = location.pathname === '/login'
  const onRegisterPage = location.pathname === '/register'

  return (
    <div className="dash-bg min-h-screen relative flex flex-col">
      <ScrollProgressBar />
      <AnimatedBackground />

      <header className="fixed top-0 left-0 right-0 z-50 dash-card border-b border-inherit backdrop-blur-2xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-primary-500/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold gradient-text">
              FINDtech
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link to="/recommend" className={cn(navLinkClass, 'flex items-center gap-1.5 text-primary-500 font-semibold')}>
              <Sparkles className="h-4 w-4" />
              <span>AI Match</span>
            </Link>
            <Link to="/browse" className={navLinkClass}>
              Catalog
            </Link>
            <Link to="/compare" className={cn(navLinkClass, 'hidden xs:inline-flex items-center gap-1.5')}>
              <Scale className="h-4 w-4" />
              <span>Compare</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl dash-text-muted hover:dash-text-primary hover:bg-primary-500/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary-600 to-cyan-600 text-white shadow-md shadow-primary-500/20 hover:opacity-90 px-3.5 py-2 rounded-xl transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <>
                {!onLoginPage && (
                  <Link to="/login" className={navLinkClass}>
                    Sign In
                  </Link>
                )}
                {!onRegisterPage && (
                  <Link
                    to="/register"
                    className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary-600 to-cyan-600 text-white shadow-md shadow-primary-500/20 hover:opacity-90 px-3.5 py-2 rounded-xl transition-all"
                  >
                    Get Started
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="pt-16 flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <ScrollToTop />
    </div>
  )
}

