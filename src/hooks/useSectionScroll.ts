import { useRef } from 'react'
import { useScroll, type MotionValue } from 'framer-motion'

export function useSectionScroll(): {
  ref: React.RefObject<HTMLElement | null>
  progress: MotionValue<number>
} {
  const ref = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return { ref, progress: scrollYProgress }
}
