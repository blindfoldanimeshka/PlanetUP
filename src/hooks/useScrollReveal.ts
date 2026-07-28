import { useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'

interface UseScrollRevealOptions {
  progress: MotionValue<number>
  start?: number
  end?: number
  direction?: 'x' | 'y'
  distance?: number
}

interface ScrollRevealResult {
  opacity: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
}

export function useScrollReveal({
  progress,
  start = 0,
  end = 1,
  direction = 'y',
  distance = 100,
}: UseScrollRevealOptions): ScrollRevealResult {
  const reduced = useReducedMotion()
  const opacity = useTransform(progress, [start, end], [0, 1])
  const translateValue = useTransform(progress, [start, end], [distance, 0])
  const zero = useTransform(() => 0)
  const fullOpacity = useTransform(() => 1)

  if (reduced) {
    return { opacity: fullOpacity, x: zero, y: zero }
  }

  if (direction === 'x') {
    return { opacity, x: translateValue, y: zero }
  }

  return { opacity, x: zero, y: translateValue }
}
