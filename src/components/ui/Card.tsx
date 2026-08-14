import { cn } from '@/lib/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  const hasPaddingOverride = /(?:^|\s)p-\d+(?:\s|$)/.test(className || '')

  return (
    <div
      className={cn(
        'rounded-2xl h-full bg-white/8 backdrop-blur-md border border-white/15',
        !hasPaddingOverride && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
