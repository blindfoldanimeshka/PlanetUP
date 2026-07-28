import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

interface ScrollRevealProps {
  children: ReactNode
  /** Direction the element slides from. Defaults to 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Slide distance in pixels. Defaults to 40. */
  distance?: number
  /** Normalised progress start [0–1]. Defaults to 0. */
  start?: number
  /** Normalised progress end [0–1]. Defaults to 1. */
  end?: number
  className?: string
}

function translateOffsets(
  dir: ScrollRevealProps['direction'],
  dist: number,
): { xStart: number; yStart: number } {
  switch (dir) {
    case 'up':
      return { xStart: 0, yStart: dist }
    case 'down':
      return { xStart: 0, yStart: -dist }
    case 'left':
      return { xStart: dist, yStart: 0 }
    case 'right':
      return { xStart: -dist, yStart: 0 }
    default:
      return { xStart: 0, yStart: dist }
  }
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 40,
  start = 0,
  end = 1,
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const { xStart, yStart } = translateOffsets(direction, distance)
  const opacity = useTransform(scrollYProgress, [start, end], [0, 1])
  const x = useTransform(scrollYProgress, [start, end], [xStart, 0])
  const y = useTransform(scrollYProgress, [start, end], [yStart, 0])

  if (reduced) {
    return <div className={cn(className)}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{ opacity, x, y }}
    >
      {children}
    </motion.div>
  )
}
