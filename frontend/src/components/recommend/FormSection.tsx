import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FormSection({
  title,
  description,
  icon,
  children,
  delay = 0,
  className,
}: FormSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn('space-y-4', className)}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-500">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display text-sm font-semibold dash-text-primary">{title}</h3>
          {description && <p className="text-xs dash-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  )
}
