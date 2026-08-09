import { useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

interface ScrollRevealProps {
  children: ReactNode
  /** Direction the element slides from. Defaults to 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Slide distance in pixels. Defaults to 40. */
  distance?: number
  /** Delay before animation starts (seconds). Defaults to 0. */
  delay?: number
  className?: string
}

function translateOffsets(
  dir: ScrollRevealProps['direction'],
  dist: number,
): { x: number; y: number } {
  switch (dir) {
    case 'up':
      return { x: 0, y: dist }
    case 'down':
      return { x: 0, y: -dist }
    case 'left':
      return { x: dist, y: 0 }
    case 'right':
      return { x: -dist, y: 0 }
    default:
      return { x: 0, y: dist }
  }
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 40,
  delay = 0,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const { x, y } = translateOffsets(direction, distance)

  if (reduced) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
