import { useState, useEffect } from 'react'

/**
 * Tracks scroll direction. Returns 'up', 'down', or 'idle'.
 * Only updates after `threshold` px of movement to avoid jitter on tiny scrolls.
 */
export function useScrollDirection(threshold = 8): 'up' | 'down' | 'idle' {
  const [direction, setDirection] = useState<'up' | 'down' | 'idle'>('idle')

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      const currentY = window.scrollY
      const diff = currentY - lastY
      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? 'down' : 'up')
        lastY = currentY
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return direction
}
