import { describe, expect, it } from 'vitest'
import { getValidityState, isCurrentlyValid, isScheduleActiveNow } from './datetime.js'

describe('datetime validity helpers', () => {
  it('keeps date-only validUntil active until the end of the local day', () => {
    const noon = new Date(2026, 3, 24, 12, 0, 0).getTime()
    const justAfterEnd = new Date(2026, 3, 25, 0, 0, 0).getTime()

    expect(isCurrentlyValid(null, '2026-04-24', noon)).toBe(true)
    expect(isCurrentlyValid(null, '2026-04-24', justAfterEnd)).toBe(false)
  })

  it('treats date-only validFrom as local day start', () => {
    const justBeforeStart = new Date(2026, 3, 23, 23, 59, 59).getTime()
    const start = new Date(2026, 3, 24, 0, 0, 0).getTime()

    expect(getValidityState('2026-04-24', null, justBeforeStart)).toBe('pending')
    expect(getValidityState('2026-04-24', null, start)).toBe('active')
  })

  it('keeps overnight schedule windows active on the following morning', () => {
    const schedule = {
      startDate: '2026-04-20',
      endDate: '2026-04-20',
      timeStart: '22:00',
      timeEnd: '06:00',
      weekdays: [1],
      isActive: true,
    }

    expect(isScheduleActiveNow(schedule, new Date('2026-04-20T23:00:00'))).toBe(true)
    expect(isScheduleActiveNow(schedule, new Date('2026-04-21T02:00:00'))).toBe(true)
    expect(isScheduleActiveNow(schedule, new Date('2026-04-21T12:00:00'))).toBe(false)
    expect(isScheduleActiveNow(schedule, new Date('2026-04-22T02:00:00'))).toBe(false)
  })
})
