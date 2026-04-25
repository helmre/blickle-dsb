import { describe, expect, it } from 'vitest'
import {
  buildProgramPages,
  getDefaultDisplayPrograms,
  resolveActiveDisplayProgram,
} from './displayProgramRules.js'

describe('displayProgramRules', () => {
  it('resolves scheduled programs before the unscheduled fallback', () => {
    const programs = [
      { id: 'standard', name: 'Standard', priority: 1, isActive: true, entries: [{ id: 'a', type: 'displayPage', targetId: 'home', enabled: true }] },
      { id: 'lunch', name: 'Mittag', priority: 5, isActive: true, entries: [{ id: 'b', type: 'systemPage', targetId: 'kantine', enabled: true }] },
    ]
    const schedules = [
      {
        id: 'schedule-lunch',
        targetType: 'program',
        targetId: 'lunch',
        startDate: '2026-04-25',
        endDate: '2026-04-25',
        locationIds: [],
        isActive: true,
      },
    ]

    const program = resolveActiveDisplayProgram({
      programs,
      schedules,
      now: new Date('2026-04-25T11:30:00'),
      locationScopeIds: ['loc-global'],
    })

    expect(program.id).toBe('lunch')
  })

  it('ignores programs assigned to another location', () => {
    const programs = [
      { id: 'fb1', name: 'FB1', priority: 10, isActive: true, locationIds: ['loc-halle1'], entries: [{ id: 'a', type: 'displayPage', targetId: 'home', enabled: true }] },
      { id: 'standard', name: 'Standard', priority: 1, isActive: true, locationIds: [], entries: [{ id: 'b', type: 'displayPage', targetId: 'home', enabled: true }] },
    ]

    const program = resolveActiveDisplayProgram({
      programs,
      schedules: [],
      now: new Date('2026-04-25T11:30:00'),
      locationScopeIds: ['loc-halle2', 'loc-global'],
    })

    expect(program.id).toBe('standard')
  })

  it('turns program entries into ordered pages and applies duration overrides', () => {
    const program = getDefaultDisplayPrograms()[0]
    const pages = buildProgramPages(program, {
      displayPages: { home: { id: 'home', duration: 99 } },
      systemPages: {
        kantine: { id: 'kantine', duration: 99 },
        snackplan: { id: 'snackplan', duration: 99 },
        produktion: { id: 'produktion', duration: 99 },
        shopfloor: { id: 'shopfloor', duration: 99 },
        social: { id: 'social', duration: 99 },
      },
      activePlaylistPages: [{ id: 'playlist-one', duration: 12 }],
      autoGroups: {
        infos: [{ id: 'infos-0', duration: 99 }],
        designer: [],
        medien: [{ id: 'media-1', duration: 17 }],
        layouts: [],
      },
    })

    expect(pages.map(page => page.id)).toEqual([
      'home',
      'kantine',
      'snackplan',
      'playlist-one',
      'infos-0',
      'produktion',
      'shopfloor',
      'social',
      'media-1',
    ])
    expect(pages[0].duration).toBe(15)
    expect(pages[3].duration).toBe(12)
  })
})
