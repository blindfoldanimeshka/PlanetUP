import { cn } from '@/lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('bg-min-surface border border-min-border p-6', className)} {...props}>
      {children}
    </div>
  )
}
