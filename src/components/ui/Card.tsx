import { cn } from '@/lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'cosmic'
}

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
  const base = 'rounded-xl transition-shadow duration-250 ease'

  const variants = {
    default:
      'bg-light-surface border border-light-border shadow-card hover:shadow-lg',
    cosmic:
      'bg-cosmic-bg-deep/80 border border-cosmic-accent/20 backdrop-blur-sm shadow-lg shadow-cosmic-glow/20 hover:shadow-glow',
  }

  return (
    <div className={cn(base, variants[variant], 'p-6', className)} {...props}>
      {children}
    </div>
  )
}
