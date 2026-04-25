import { describe, expect, it } from 'vitest'
import {
  activeSchedulesForTarget,
  resolveActivePlaylist,
  resolvePlaylistDurations,
  resolvePlaylistPageEntries,
  scheduleMatchesLocation,
  sortPlaylistItems,
} from './playlistResolver.js'

describe('playlistResolver', () => {
  it('matches global schedules and inherited location scopes', () => {
    expect(scheduleMatchesLocation({ locationIds: [] }, ['loc-fb1'])).toBe(true)
    expect(scheduleMatchesLocation({ locationIds: ['loc-global'] }, ['loc-fb1', 'loc-global'])).toBe(true)
    expect(scheduleMatchesLocation({ locationIds: ['loc-fb2'] }, ['loc-fb1', 'loc-global'])).toBe(false)
    expect(scheduleMatchesLocation({ locationIds: ['loc-fb2'] }, [])).toBe(false)
    expect(scheduleMatchesLocation({ locationIds: ['loc-global'] }, [])).toBe(true)
  })

  it('selects the highest-priority active scheduled playlist', () => {
    const playlist = resolveActivePlaylist({
      playlists: [
        { id: 'default', priority: 100, items: [{ contentId: 'a' }] },
        { id: 'shift', priority: 1, items: [{ contentId: 'b' }] },
      ],
      schedules: [
        {
          id: 'schedule-shift',
          targetType: 'playlist',
          targetId: 'shift',
          startDate: '2026-04-24',
          endDate: '2026-04-24',
          locationIds: ['loc-global'],
          isActive: true,
        },
      ],
      now: new Date('2026-04-24T10:00:00+02:00'),
      locationScopeIds: ['loc-fb1', 'loc-global'],
    })

    expect(playlist.id).toBe('shift')
  })

  it('falls back to an unscheduled playlist when scheduled options are inactive', () => {
    const playlist = resolveActivePlaylist({
      playlists: [
        { id: 'default', priority: 10, items: [{ contentId: 'a' }] },
        { id: 'inactive', priority: 99, items: [{ contentId: 'b' }] },
      ],
      schedules: [
        {
          id: 'schedule-inactive',
          targetType: 'playlist',
          targetId: 'inactive',
          startDate: '2026-04-25',
          endDate: '2026-04-25',
          locationIds: ['loc-global'],
          isActive: true,
        },
      ],
      now: new Date('2026-04-24T10:00:00+02:00'),
      locationScopeIds: ['loc-fb1', 'loc-global'],
    })

    expect(playlist.id).toBe('default')
  })

  it('keeps playlist ordering, visible page entries, and durations deterministic', () => {
    const playlist = {
      id: 'playlist',
      items: [
        { id: 'two', contentId: 'content-b', order: 2, duration: 22 },
        { id: 'one', contentId: 'content-a', order: 1, duration: 11 },
        { id: 'missing', contentId: 'content-x', order: 3, duration: 99 },
      ],
    }
    const items = sortPlaylistItems(playlist)
    const entries = resolvePlaylistPageEntries({
      playlistItems: items,
      locationContent: [
        { id: 'content-a', title: 'A' },
        { id: 'content-b', title: 'B' },
      ],
    })

    expect(items.map(item => item.id)).toEqual(['one', 'two', 'missing'])
    expect(entries.map(entry => entry.content.id)).toEqual(['content-a', 'content-b'])
    expect(resolvePlaylistDurations(items)).toEqual({
      'content-a': 11,
      'content-b': 22,
      'content-x': 99,
    })
  })

  it('filters active schedules by target, time, and location', () => {
    const active = activeSchedulesForTarget(
      [
        {
          id: 'match',
          targetType: 'content',
          targetId: 'content-a',
          startDate: '2026-04-24',
          endDate: '2026-04-24',
          locationIds: ['loc-global'],
          isActive: true,
        },
        {
          id: 'other-location',
          targetType: 'content',
          targetId: 'content-a',
          startDate: '2026-04-24',
          endDate: '2026-04-24',
          locationIds: ['loc-fb2'],
          isActive: true,
        },
      ],
      'content',
      'content-a',
      new Date('2026-04-24T10:00:00+02:00'),
      ['loc-fb1', 'loc-global']
    )

    expect(active.map(schedule => schedule.id)).toEqual(['match'])
  })
})
