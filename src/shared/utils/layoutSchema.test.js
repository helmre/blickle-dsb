import { describe, expect, it } from 'vitest'
import { normalizeLayout, normalizeZoneGrid, zoneGridStyle } from './layoutSchema.js'

describe('layout schema helpers', () => {
  it('normalizes legacy editor grid fields to the canonical layout schema', () => {
    const layout = normalizeLayout({
      id: 'legacy',
      columns: 3,
      rows: 2,
      zones: [
        { id: 'zone-a', gridColumn: '2 / 4', gridRow: '1 / 3' },
      ],
    })

    expect(layout.gridColumns).toBe(3)
    expect(layout.gridRows).toBe(2)
    expect(layout.zones[0]).toMatchObject({
      gridColumnStart: 2,
      gridColumnEnd: 4,
      gridRowStart: 1,
      gridRowEnd: 3,
    })
  })

  it('keeps invalid grid ranges inside a renderable one-cell fallback', () => {
    const zone = normalizeZoneGrid({ gridColumn: '4 / 2', gridRowStart: 0, gridRowEnd: 0 })

    expect(zoneGridStyle(zone)).toEqual({
      gridColumn: '4 / 5',
      gridRow: '1 / 2',
    })
  })
})
