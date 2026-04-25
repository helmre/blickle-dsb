import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope, ref } from 'vue'
import { useDisplayContent } from './useDisplayContent.js'
import { installMemoryStorage } from '../../test/localStorage.js'

const baseContent = [
  {
    id: 'content-a',
    title: 'Erste Playlist-Seite',
    description: '',
    type: 'template',
    templateId: 'tpl-announcement',
    templateParams: { titel: 'A', text: 'A' },
    status: 'approved',
    createdAt: '2026-04-24T09:00:00.000Z',
    tags: [],
    locationIds: [],
  },
  {
    id: 'content-b',
    title: 'Zweite Playlist-Seite',
    description: '',
    type: 'template',
    templateId: 'tpl-announcement',
    templateParams: { titel: 'B', text: 'B' },
    status: 'approved',
    createdAt: '2026-04-24T09:00:00.000Z',
    tags: [],
    locationIds: [],
  },
  {
    id: 'content-c',
    title: 'Normale Info',
    description: '',
    type: 'text',
    status: 'approved',
    createdAt: '2026-04-24T09:00:00.000Z',
    tags: [],
    locationIds: [],
  },
]

describe('useDisplayContent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-24T10:00:00.000Z'))
    installMemoryStorage({
      dsb_content: JSON.stringify(baseContent),
      dsb_playlists: JSON.stringify([
        {
          id: 'playlist-main',
          name: 'Hauptplaylist',
          priority: 10,
          items: [
            { id: 'pi-b', contentId: 'content-b', order: 1, duration: 22 },
            { id: 'pi-a', contentId: 'content-a', order: 2, duration: 11 },
          ],
        },
      ]),
      dsb_locations: JSON.stringify([{ id: 'loc-global', name: 'Global', parentId: null }]),
      dsb_layouts: JSON.stringify([]),
      dsb_schedules: JSON.stringify([]),
    })
    setActivePinia(createPinia())
  })

  it('turns active playlist items into ordered display pages with durations', () => {
    const { displayPages, navGroups } = useDisplayContent()
    const playlistPages = displayPages.value.filter(page => page.navGroupId === 'playlist')

    expect(playlistPages.map(page => page.zones[0].contentId)).toEqual(['content-b', 'content-a'])
    expect(playlistPages.map(page => page.duration)).toEqual([22, 11])
    expect(navGroups.value.some(group => group.id === 'playlist')).toBe(true)
  })

  it('does not duplicate playlist content in info pages', () => {
    const { displayPages } = useDisplayContent()
    const infoZones = displayPages.value
      .filter(page => page.navGroupId === 'infos')
      .flatMap(page => page.zones)

    expect(infoZones.map(zone => zone.contentId)).toEqual(['content-c'])
  })

  it('prefers playlist schedules that are active for the current location', () => {
    localStorage.setItem('dsb_locations', JSON.stringify([
      { id: 'loc-global', name: 'Global', parentId: null },
      { id: 'loc-halle1', name: 'Halle 1', parentId: 'loc-global' },
    ]))
    localStorage.setItem('dsb_playlists', JSON.stringify([
      {
        id: 'playlist-main',
        name: 'Standard',
        priority: 10,
        items: [{ id: 'pi-a', contentId: 'content-a', order: 1, duration: 11 }],
      },
      {
        id: 'playlist-shift',
        name: 'Schichtinfo',
        priority: 1,
        items: [{ id: 'pi-c', contentId: 'content-c', order: 1, duration: 33 }],
      },
    ]))
    localStorage.setItem('dsb_schedules', JSON.stringify([
      {
        id: 'schedule-playlist',
        targetType: 'playlist',
        targetId: 'playlist-shift',
        startDate: '2026-04-24',
        endDate: '2026-04-24',
        locationIds: ['loc-global'],
        isActive: true,
      },
    ]))
    setActivePinia(createPinia())

    const { activePlaylist, displayPages } = useDisplayContent('loc-halle1')
    const playlistPages = displayPages.value.filter(page => page.navGroupId === 'playlist')

    expect(activePlaylist.value.id).toBe('playlist-shift')
    expect(playlistPages.map(page => page.zones[0].contentId)).toEqual(['content-c'])
    expect(playlistPages[0].duration).toBe(33)
  })

  it('falls back to an unscheduled playlist when a scheduled playlist is not active here', () => {
    localStorage.setItem('dsb_locations', JSON.stringify([
      { id: 'loc-global', name: 'Global', parentId: null },
      { id: 'loc-halle1', name: 'Halle 1', parentId: 'loc-global' },
      { id: 'loc-halle2', name: 'Halle 2', parentId: 'loc-global' },
    ]))
    localStorage.setItem('dsb_playlists', JSON.stringify([
      {
        id: 'playlist-main',
        name: 'Standard',
        priority: 10,
        items: [{ id: 'pi-a', contentId: 'content-a', order: 1, duration: 11 }],
      },
      {
        id: 'playlist-halle2',
        name: 'Nur Halle 2',
        priority: 99,
        items: [{ id: 'pi-c', contentId: 'content-c', order: 1, duration: 33 }],
      },
    ]))
    localStorage.setItem('dsb_schedules', JSON.stringify([
      {
        id: 'schedule-playlist-halle2',
        targetType: 'playlist',
        targetId: 'playlist-halle2',
        startDate: '2026-04-24',
        endDate: '2026-04-24',
        locationIds: ['loc-halle2'],
        isActive: true,
      },
    ]))
    setActivePinia(createPinia())

    const { activePlaylist } = useDisplayContent('loc-halle1')

    expect(activePlaylist.value.id).toBe('playlist-main')
  })

  it('normalizes legacy custom layout fields for display rendering', () => {
    localStorage.setItem('dsb_layouts', JSON.stringify([
      {
        id: 'layout-custom',
        name: 'Legacy Layout',
        columns: 3,
        rows: 2,
        zones: [
          { id: 'zone-legacy', name: 'Legacy Zone', gridColumn: '2 / 4', gridRow: '1 / 3' },
        ],
      },
    ]))
    setActivePinia(createPinia())

    const { displayPages } = useDisplayContent()
    const layoutPage = displayPages.value.find(page => page.id === 'layout-layout-custom')

    expect(layoutPage.customGrid).toEqual({ columns: 3, rows: 2 })
    expect(layoutPage.zones[0]).toMatchObject({
      gridColumn: '2 / 4',
      gridRow: '1 / 3',
    })
  })

  it('can build pages against a simulated date and time', () => {
    localStorage.setItem('dsb_content', JSON.stringify([
      ...baseContent,
      {
        id: 'content-future',
        title: 'Zukünftige Info',
        description: '',
        type: 'text',
        status: 'approved',
        createdAt: '2026-04-24T09:00:00.000Z',
        validFrom: '2026-04-25',
        validUntil: '2026-04-25',
        tags: [],
        locationIds: [],
      },
    ]))
    setActivePinia(createPinia())
    const simulatedNow = ref('2026-04-24T10:00:00')
    const { locationContent } = useDisplayContent(null, { now: simulatedNow })

    expect(locationContent.value.some(content => content.id === 'content-future')).toBe(false)

    simulatedNow.value = '2026-04-25T10:00:00'

    expect(locationContent.value.some(content => content.id === 'content-future')).toBe(true)
  })

  it('refreshes time-based eligibility while the display keeps running', () => {
    localStorage.setItem('dsb_content', JSON.stringify([
      ...baseContent,
      {
        id: 'content-future',
        title: 'Automatisch sichtbar',
        description: '',
        type: 'text',
        status: 'approved',
        createdAt: '2026-04-24T09:00:00.000Z',
        validFrom: '2026-04-24T10:00:30.000Z',
        tags: [],
        locationIds: [],
      },
    ]))
    setActivePinia(createPinia())

    const previousWindow = globalThis.window
    globalThis.window = {
      setInterval: globalThis.setInterval,
      clearInterval: globalThis.clearInterval,
    }

    const scope = effectScope()
    try {
      let locationContent
      scope.run(() => {
        ;({ locationContent } = useDisplayContent(null, { clockIntervalMs: 1000 }))
      })

      expect(locationContent.value.some(content => content.id === 'content-future')).toBe(false)

      vi.setSystemTime(new Date('2026-04-24T10:00:31.000Z'))
      vi.advanceTimersByTime(1000)

      expect(locationContent.value.some(content => content.id === 'content-future')).toBe(true)
    } finally {
      scope.stop()
      globalThis.window = previousWindow
    }
  })

  it('puts a draft preview page first without requiring persisted content', () => {
    const previewContent = ref({
      id: 'preview-draft',
      title: 'Noch nicht gespeichert',
      description: '',
      type: 'template',
      templateId: 'tpl-announcement',
      templateParams: { titel: 'Preview', text: 'Preview' },
      status: 'approved',
      createdAt: '2026-04-24T09:00:00.000Z',
      tags: [],
      locationIds: ['loc-global'],
    })

    const { displayPages, navGroups } = useDisplayContent(null, { previewContent })

    expect(displayPages.value[0]).toMatchObject({
      id: 'preview-preview-draft',
      navGroupId: 'preview',
      label: 'VORSCHAU',
    })
    expect(displayPages.value[0].zones[0].content).toBe(previewContent.value)
    expect(navGroups.value[0]).toMatchObject({ id: 'preview', label: 'VORSCHAU' })
  })
})
