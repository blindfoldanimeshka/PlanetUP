import { type ReactNode } from 'react'

interface SmoothScrollProviderProps {
  children: ReactNode
}

/**
 * No-op smooth scroll wrapper.
 * Drop-in ready to swap with a Lenis provider when needed — no consumer changes required.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>
}
