export const scrollEasings = {
  easeInOut: [0.42, 0, 0.58, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  linear: [0, 0, 1, 1] as const,
} as const

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
