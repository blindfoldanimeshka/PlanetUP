import { cn } from '@/lib/cn'

export type SectionVariant = 'default' | 'compact' | 'spacious' | 'surface'

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  id?: string
  variant?: SectionVariant
}

const VARIANT_CLASSES: Record<SectionVariant, string> = {
  default: 'py-12 md:py-20',
  compact: 'py-8 md:py-12',
  spacious: 'py-16 md:py-24',
  surface: 'py-12 md:py-20 bg-white/[0.02]',
}

export function Section({ children, id, className, variant = 'default', ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(VARIANT_CLASSES[variant], 'text-min-text', className)}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4">{children}</div>
    </section>
  )
}
