import { useScroll, useSpring, type MotionValue } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'

export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll()
  const reduced = useReducedMotion()
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })

  return reduced ? scrollYProgress : springProgress
}
