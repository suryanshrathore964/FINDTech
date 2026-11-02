import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { PageTransition } from './PageTransition'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'

export function AppLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const { isDark } = useTheme()

  return (
    <div className="dash-bg min-h-screen relative flex flex-col">
      <ScrollProgressBar />

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <motion.div
          className={cn(
            'absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl',
            isDark ? 'bg-primary-600/15' : 'bg-primary-300/20'
          )}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={cn(
            'absolute bottom-0 -left-32 h-80 w-80 rounded-full blur-3xl',
            isDark ? 'bg-cyan-500/10' : 'bg-mint-300/15'
          )}
          animate={{ x: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className={cn(
            'absolute inset-0 opacity-30',
            isDark ? 'landing-grid' : 'grid-pattern'
          )}
        />
      </div>

      {/* Desktop Sidebar (hidden on phone/tablet <lg) */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Mobile & Tablet Navigation Header + Floating Bottom Dock */}
      <MobileNav />

      {/* Main Content Area */}
      <main
        className={cn(
          'min-h-screen flex-1 transition-all duration-300',
          // Desktop margins:
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
          // Mobile & Tablet spacing: top nav bar clearance (pt-16) and bottom dock clearance (pb-24), no left margin
          'ml-0 pt-16 lg:pt-6 pb-24 lg:pb-8 px-3 sm:px-6 lg:px-8'
        )}
      >
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

