import { describe, it, expect } from 'vitest'
import { computeTargetSize, MAX_PHOTO_EDGE_PX } from '../src/lib/imageCompress.js'

describe('computeTargetSize', () => {
  it('keeps small images untouched (no upscaling)', () => {
    expect(computeTargetSize(800, 600)).toEqual({ width: 800, height: 600 })
  })

  it('scales landscape images down so the long edge fits the cap', () => {
    const t = computeTargetSize(4000, 3000)
    expect(Math.max(t.width, t.height)).toBeLessThanOrEqual(MAX_PHOTO_EDGE_PX)
    expect(t.width / t.height).toBeCloseTo(4000 / 3000, 5)
  })

  it('scales portrait images down preserving aspect ratio', () => {
    const t = computeTargetSize(3000, 4000)
    expect(Math.max(t.width, t.height)).toBeLessThanOrEqual(MAX_PHOTO_EDGE_PX)
    expect(t.width / t.height).toBeCloseTo(3000 / 4000, 5)
  })

  it('never produces zero or fractional dimensions', () => {
    const t = computeTargetSize(10000, 3)
    expect(t.width).toBeGreaterThanOrEqual(1)
    expect(t.height).toBeGreaterThanOrEqual(1)
    expect(Number.isInteger(t.width)).toBe(true)
    expect(Number.isInteger(t.height)).toBe(true)
  })

  it('handles the exact-cap boundary without scaling', () => {
    expect(computeTargetSize(MAX_PHOTO_EDGE_PX, MAX_PHOTO_EDGE_PX / 2)).toEqual({
      width: MAX_PHOTO_EDGE_PX,
      height: MAX_PHOTO_EDGE_PX / 2,
    })
  })
})
