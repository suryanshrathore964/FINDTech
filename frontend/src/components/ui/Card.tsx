import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLMotionProps<'div'> {
  glass?: boolean
  hover?: boolean
}

export function Card({ className, glass = true, hover = false, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'rounded-2xl p-6',
        glass ? 'glass' : 'bg-white border border-slate-100 shadow-md',
        hover && 'cursor-pointer transition-shadow hover:shadow-xl hover:shadow-primary-500/10',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
