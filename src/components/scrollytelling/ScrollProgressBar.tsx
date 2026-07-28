import { motion, useScroll, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ScrollProgressBar() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })

  if (reduced) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 3,
      }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-cosmic-accent to-cosmic-accent-2"
        style={{ scaleX, transformOrigin: '0% 50%' }}
      />
    </div>
  )
}
