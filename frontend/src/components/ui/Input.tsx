import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white/90 dark:bg-white/5 px-4 py-2.5 text-slate-900 dark:text-white',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-500/20 focus:outline-none',
          error && 'border-red-400 focus:ring-red-100 dark:border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
