import { useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'
import { clamp } from '@/lib/scrollAnimations'

export function useParallax(
  speed: number = 0.5,
  distance: number = 200,
): MotionValue<number> {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, (latest) => clamp(latest * speed, -distance, distance))
  const zero = useTransform(() => 0)

  return reduced ? zero : y
}
