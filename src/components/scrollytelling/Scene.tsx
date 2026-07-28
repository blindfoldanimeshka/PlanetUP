import { type ReactNode } from 'react'
import { motion, useTransform } from 'framer-motion'
import { cn } from '@/lib/cn'
import { usePinnedSectionProgress } from './PinnedSectionContext'

interface SceneProps {
  children: ReactNode
  /** Visibility range within the parent PinnedSection [0–1]. Defaults to [0, 1]. */
  progressRange?: [number, number]
  className?: string
}

function splitRange([a, b]: [number, number]): [number, number, number, number] {
  const third = (b - a) / 3
  return [a, a + third, a + third * 2, b]
}

export function Scene({
  children,
  progressRange = [0, 1],
  className,
}: SceneProps) {
  const progress = usePinnedSectionProgress()
  const [in1, in2, out1, out2] = splitRange(progressRange)
  const opacity = useTransform(progress, [in1, in2, out1, out2], [0, 1, 1, 0])
  const y = useTransform(progress, [progressRange[0], progressRange[1]], [50, 0])

  return (
    <motion.div
      className={cn('absolute inset-0 flex items-center justify-center', className)}
      style={{ opacity, y }}
    >
      {children}
    </motion.div>
  )
}
