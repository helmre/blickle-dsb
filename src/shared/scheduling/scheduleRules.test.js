import { describe, expect, it } from 'vitest'
import {
  buildCalendarDays,
  createDefaultScheduleDraft,
  formatTimeWindow,
  formatWeekdays,
  normalizeScheduleDraft,
  scheduleCoversDate,
  validateScheduleDraft,
  weekdayPreset,
} from './scheduleRules.js'

describe('scheduleRules', () => {
  it('validates required fields and invalid date ranges', () => {
    expect(validateScheduleDraft(createDefaultScheduleDraft()).map(issue => issue.key)).toEqual([
      'targetId',
      'startDate',
      'endDate',
    ])

    expect(validateScheduleDraft(createDefaultScheduleDraft({
      targetId: 'content-1',
      startDate: '2026-04-25',
      endDate: '2026-04-24',
    })).map(issue => issue.key)).toEqual(['dateRange'])
  })

  it('normalizes all-day and timed drafts for persistence', () => {
    expect(normalizeScheduleDraft(createDefaultScheduleDraft({
      targetId: 'content-1',
      startDate: '2026-04-24',
      endDate: '2026-04-24',
      allDay: true,
      timeStart: '08:00',
      timeEnd: '12:00',
      weekdays: [],
    }))).toMatchObject({
      timeStart: null,
      timeEnd: null,
      weekdays: null,
    })

    expect(normalizeScheduleDraft(createDefaultScheduleDraft({
      targetId: 'content-1',
      startDate: '2026-04-24',
      endDate: '2026-04-24',
      allDay: false,
      timeStart: '08:00',
      timeEnd: '12:00',
      weekdays: [1, 2],
    }))).toMatchObject({
      timeStart: '08:00',
      timeEnd: '12:00',
      weekdays: [1, 2],
    })
  })

  it('formats weekday presets and time windows', () => {
    expect(weekdayPreset('workdays')).toEqual([1, 2, 3, 4, 5])
    expect(formatWeekdays([1, 3, 0])).toBe('Mo Mi So')
    expect(formatWeekdays([])).toBe('Alle Tage')
    expect(formatTimeWindow({ timeStart: '22:00', timeEnd: '06:00' })).toBe('22:00-06:00')
  })

  it('detects whether schedules cover calendar dates and weekdays', () => {
    const schedule = {
      startDate: '2026-04-20',
      endDate: '2026-04-26',
      weekdays: [1, 3],
    }

    expect(scheduleCoversDate(schedule, '2026-04-20')).toBe(true)
    expect(scheduleCoversDate(schedule, '2026-04-21')).toBe(false)
    expect(scheduleCoversDate(schedule, '2026-04-27')).toBe(false)
    expect(scheduleCoversDate({ ...schedule, isActive: false }, '2026-04-20')).toBe(false)
  })

  it('builds calendar cells with schedule counts', () => {
    const cells = buildCalendarDays({
      year: 2026,
      month: 3,
      schedules: [
        { startDate: '2026-04-24', endDate: '2026-04-24', weekdays: null },
        { startDate: '2026-04-24', endDate: '2026-04-25', weekdays: null },
      ],
    })
    const april24 = cells.find(cell => cell.date === '2026-04-24')

    expect(april24).toMatchObject({
      day: 24,
      hasSchedule: true,
      scheduleCount: 2,
    })
  })
})
