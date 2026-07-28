import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

const PinnedSectionContext = createContext<MotionValue<number> | null>(null)

export function usePinnedSectionProgress(): MotionValue<number> {
  const ctx = useContext(PinnedSectionContext)
  if (!ctx) {
    throw new Error(
      'usePinnedSectionProgress must be used within a <PinnedSection> component',
    )
  }
  return ctx
}

export default PinnedSectionContext
