import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

interface StickyTransitionSectionProps {
  children: ReactNode
  className?: string
  /** Whether this is the first section (Hero) — gets gentler transforms */
  isHero?: boolean
}

export function StickyTransitionSection({
  children,
  className,
  isHero = false,
}: StickyTransitionSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Hero gets gentler effect to not conflict with its own parallax
  const scaleRange = isHero ? [0.92, 1, 1, 0.92] : [0.85, 1, 1, 0.85]

  const scale = useTransform(springProgress, [0, 0.25, 0.75, 1], scaleRange)

  if (reduced) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={cn('origin-center will-change-transform', className)}
      style={{ scale }}
    >
      {children}
    </motion.div>
  )
}
