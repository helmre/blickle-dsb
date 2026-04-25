import { describe, expect, it } from 'vitest'
import {
  buildContentDiagnostics,
  describeDisplayPage,
  explainPlaylistDecision,
} from './displayDecisionEngine.js'

describe('displayDecisionEngine', () => {
  it('explains why content is visible or blocked', () => {
    const diagnostics = buildContentDiagnostics({
      contents: [
        {
          id: 'visible',
          title: 'Sichtbar',
          status: 'approved',
          validFrom: '2026-04-24',
          validUntil: '2026-04-24',
          locationIds: ['loc-fb1'],
        },
        {
          id: 'wrong-location',
          title: 'Andere Halle',
          status: 'approved',
          locationIds: ['loc-fb2'],
        },
        {
          id: 'draft',
          title: 'Entwurf',
          status: 'draft',
          locationIds: [],
        },
      ],
      now: new Date('2026-04-24T14:00:00+02:00'),
      locationId: 'loc-fb1',
      locationScopeIds: ['loc-fb1', 'loc-global'],
    })

    expect(diagnostics[0]).toMatchObject({
      id: 'visible',
      visible: true,
      reason: 'Wird angezeigt',
    })
    expect(diagnostics.find(item => item.id === 'wrong-location')).toMatchObject({
      visible: false,
      reason: 'nicht für diesen Standort geplant',
    })
    expect(diagnostics.find(item => item.id === 'draft')).toMatchObject({
      visible: false,
      reason: 'Status: Entwurf',
    })
  })

  it('explains inactive content schedules', () => {
    const diagnostics = buildContentDiagnostics({
      contents: [
        {
          id: 'scheduled',
          title: 'Geplant',
          status: 'approved',
          locationIds: [],
        },
      ],
      schedules: [
        {
          id: 'schedule-1',
          targetType: 'content',
          targetId: 'scheduled',
          startDate: '2026-04-25',
          endDate: '2026-04-25',
          locationIds: [],
          isActive: true,
        },
      ],
      now: new Date('2026-04-24T14:00:00+02:00'),
    })

    expect(diagnostics[0]).toMatchObject({
      visible: false,
      reason: 'Zeitplan aktuell inaktiv',
      scheduleCount: 1,
      activeScheduleCount: 0,
    })
  })

  it('explains scheduled playlist wins and default fallbacks', () => {
    const playlists = [
      { id: 'default', name: 'Standard', priority: 10, items: [{ contentId: 'a' }] },
      { id: 'shift', name: 'Schichtinfo', priority: 1, items: [{ contentId: 'b' }] },
    ]
    const schedules = [
      {
        id: 'schedule-playlist',
        targetType: 'playlist',
        targetId: 'shift',
        startDate: '2026-04-24',
        endDate: '2026-04-24',
        locationIds: ['loc-global'],
        isActive: true,
      },
    ]

    expect(explainPlaylistDecision({
      activePlaylist: playlists[1],
      playlists,
      schedules,
      now: new Date('2026-04-24T14:00:00+02:00'),
      locationScopeIds: ['loc-fb1', 'loc-global'],
    })).toMatchObject({
      label: 'Schichtinfo',
      mode: 'scheduled',
      reason: 'Ein aktiver Playlist-Zeitplan gewinnt für diesen Zeitpunkt und Standort.',
    })

    expect(explainPlaylistDecision({
      activePlaylist: playlists[0],
      playlists,
      schedules,
      now: new Date('2026-04-25T14:00:00+02:00'),
      locationScopeIds: ['loc-fb1', 'loc-global'],
    })).toMatchObject({
      label: 'Standard',
      mode: 'fallback',
    })
  })

  it('describes the selected display page with source and facts', () => {
    const description = describeDisplayPage(
      {
        id: 'playlist-item',
        navGroupId: 'playlist',
        label: 'Sicherheitsinfo',
        duration: 22,
        zones: [{ id: 'zone', contentId: 'content-a' }],
      },
      {
        activePlaylist: { id: 'playlist', name: 'Schichtrotation' },
        contentById: new Map([['content-a', { title: 'PSA tragen' }]]),
        locationName: 'FB1',
        locationScopeIds: ['loc-fb1', 'loc-global'],
      }
    )

    expect(description.source).toBe('Playlist')
    expect(description.contentTitles).toEqual(['PSA tragen'])
    expect(description.facts).toContain('Reihenfolge und Dauer kommen aus "Schichtrotation".')
    expect(description.facts).toContain('Dauer in Rotation: 22s')
  })
})
