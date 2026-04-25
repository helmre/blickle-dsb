import { describe, expect, it } from 'vitest'
import { calculateDisplayScale } from './displayScale.js'

describe('calculateDisplayScale', () => {
  it('fits a 1920x1080 display into the viewport without cropping', () => {
    expect(calculateDisplayScale(1920, 1080)).toBe(1)
    expect(calculateDisplayScale(960, 1080)).toBe(0.5)
    expect(calculateDisplayScale(1920, 540)).toBe(0.5)
  })

  it('falls back to 1 for invalid viewport dimensions', () => {
    expect(calculateDisplayScale(0, 1080)).toBe(1)
    expect(calculateDisplayScale(Number.NaN, 1080)).toBe(1)
  })
})
