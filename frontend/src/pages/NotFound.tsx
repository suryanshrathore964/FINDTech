import { Link } from 'react-router-dom'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <GlassPanel strong className="p-12 text-center max-w-md">
        <p className="font-display text-6xl font-bold gradient-text mb-4">404</p>
        <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/">
          <Button>Go home</Button>
        </Link>
      </GlassPanel>
    </div>
  )
}
