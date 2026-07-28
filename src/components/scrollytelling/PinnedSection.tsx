import { useRef, type ReactNode } from 'react'
import { useScroll } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import PinnedSectionContext from './PinnedSectionContext'

interface PinnedSectionProps {
  children: ReactNode
  /** CSS height for the track container. Defaults to '300vh' for long scroll. */
  trackHeight?: string
  /** When true, renders a normal section without sticky pinning. */
  disabled?: boolean
  className?: string
}

export function PinnedSection({
  children,
  trackHeight = '300vh',
  disabled = false,
  className,
}: PinnedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  if (disabled || reduced) {
    return <section className={className}>{children}</section>
  }

  return (
    <section
      ref={ref}
      className={className}
      style={{ height: trackHeight, position: 'relative' }}
    >
      <PinnedSectionContext.Provider value={scrollYProgress}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </PinnedSectionContext.Provider>
    </section>
  )
}
