import { cn } from '@/lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
      <div className={cn('neu-raised rounded-2xl p-6 h-full', className)} {...props}>
      {children}
    </div>
  )
}
