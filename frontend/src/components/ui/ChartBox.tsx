import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChartBoxProps {
  height: number
  children: ReactNode
  className?: string
}

/** Defers chart render until layout is stable (fixes Recharts -1 width during page transitions). */
export function ChartBox({ height, children, className }: ChartBoxProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className={cn('w-full min-w-0', className)} style={{ height, minHeight: height }}>
      {ready ? children : null}
    </div>
  )
}
