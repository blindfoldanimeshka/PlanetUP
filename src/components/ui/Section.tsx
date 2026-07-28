import { cn } from '@/lib/cn'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  id?: string
}

export function Section({ children, id, className, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-24 md:py-32 bg-min-bg text-min-text', className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
