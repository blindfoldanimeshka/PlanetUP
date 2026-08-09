import { cn } from '@/lib/cn'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  id?: string
}

export function Section({ children, id, className, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn('py-16 md:py-24 text-min-text', className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
