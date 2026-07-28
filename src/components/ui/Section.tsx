import { cn } from '@/lib/cn'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  id?: string
  variant?: 'light' | 'cosmic'
}

export function Section({ children, id, variant = 'light', className, ...props }: SectionProps) {
  const variants = {
    light: 'bg-light-bg text-light-text',
    cosmic: 'bg-cosmic-bg text-white',
  }

  return (
    <section
      id={id}
      className={cn('py-16 md:py-24', variants[variant], className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
