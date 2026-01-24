import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-bold rounded-2xl
      transition-all duration-150 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variantStyles = {
      primary: `
        bg-primary-500 text-white
        border-b-4 border-primary-700
        hover:bg-primary-400
        active:border-b-0 active:translate-y-1
        focus:ring-primary-500
      `,
      secondary: `
        bg-neutral-100 text-neutral-800
        border-b-4 border-neutral-300
        hover:bg-neutral-50
        active:border-b-0 active:translate-y-1
        focus:ring-neutral-400
      `,
      ghost: `
        bg-transparent text-neutral-700
        border-b-4 border-transparent
        hover:bg-neutral-100
        active:translate-y-0.5
        focus:ring-neutral-400
      `,
      danger: `
        bg-error-500 text-white
        border-b-4 border-red-700
        hover:bg-red-400
        active:border-b-0 active:translate-y-1
        focus:ring-error-500
      `,
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
