import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-250 ease focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'

    const variants = {
      primary:
        'bg-cosmic-accent text-white shadow-md shadow-cosmic-accent/30 hover:bg-cosmic-accent-2 hover:shadow-lg hover:shadow-cosmic-accent-2/40 hover:-translate-y-0.5',
      secondary:
        'border-2 border-cosmic-accent text-cosmic-accent bg-transparent hover:bg-cosmic-accent hover:text-white hover:-translate-y-0.5',
      ghost:
        'text-cosmic-accent hover:bg-cosmic-accent/10 hover:text-cosmic-accent-2',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
