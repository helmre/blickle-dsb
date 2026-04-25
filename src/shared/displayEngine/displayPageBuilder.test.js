import { describe, expect, it } from 'vitest'
import { buildDefaultHomeDisplayPage } from './displayPageDefaults.js'
import { buildDisplayPageFromConfig, buildZoneFromSlot } from './displayPageBuilder.js'

describe('displayPageBuilder', () => {
  it('maps the default HOME display page to the existing render shape', () => {
    const page = buildDisplayPageFromConfig(buildDefaultHomeDisplayPage())

    expect(page).toMatchObject({
      id: 'home',
      navGroupId: 'home',
      label: 'HOME',
      iconName: 'home',
      layout: 'custom',
      noZoneChrome: true,
      duration: 15,
      customGrid: { columns: 12, rows: 2 },
    })

    expect(page.zones).toEqual([
      { id: 'home-karriere', type: 'karriere', title: 'Karriere bei Blickle', gridColumn: '1 / 8', gridRow: '1 / 2' },
      { id: 'home-kantine', type: 'canteen-menu', title: 'Heute im s\'Rädle', gridColumn: '8 / 13', gridRow: '1 / 2' },
      { id: 'home-wetter', type: 'weather', title: 'Wetter', gridColumn: '1 / 5', gridRow: '2 / 3' },
      { id: 'home-news', type: 'news-feed', title: 'News', gridColumn: '5 / 13', gridRow: '2 / 3' },
    ])
  })

  it('drops unknown widget slots instead of creating broken zones', () => {
    const zone = buildZoneFromSlot({
      id: 'slot-unknown',
      source: { type: 'widget', id: 'does-not-exist' },
    })

    expect(zone).toBeNull()
  })

  it('maps media sources to fullscreen media zones', () => {
    const zone = buildZoneFromSlot({
      id: 'slot-media',
      gridColumn: '1 / 2',
      gridRow: '1 / 2',
      source: {
        type: 'media',
        mediaUrl: '/media/demo.mp4',
        mediaType: 'video',
        title: 'Demo',
      },
    })

    expect(zone).toEqual({
      id: 'slot-media',
      type: 'fullscreen-media',
      title: 'Demo',
      mediaUrl: '/media/demo.mp4',
      mediaType: 'video',
      pdfUrl: null,
      fit: 'contain',
      gridColumn: '1 / 2',
      gridRow: '1 / 2',
    })
  })
})
