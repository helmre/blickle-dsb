import { computed, unref } from 'vue'
import { useContentStore } from '../stores/contentStore.js'
import { useScheduleStore } from '../stores/scheduleStore.js'
import { useLocationStore } from '../stores/locationStore.js'
import { useLayoutStore } from '../stores/layoutStore.js'
import { usePlaylistStore } from '../stores/playlistStore.js'
import { getSeedScheduleData, getSeedCanteenData, getSeedTickerMessages as getSeedTicker, getSeedFullscreenMedia } from '../utils/seedData.js'

/**
 * Composable that builds dynamic display pages from store data.
 * Bridges the gap between Admin (stores) and Display (rendering).
 *
 * Now integrates:
 * - layoutStore: Custom grid layouts from the Layout Editor
 * - playlistStore: Playlist-driven page rotation with per-page duration
 *
 * @param {string|null} locationId - Optional location filter from route param
 */
export function useDisplayContent(locationId = null) {
  const contentStore = useContentStore()
  const scheduleStore = useScheduleStore()
  const locationStore = useLocationStore()
  const layoutStore = useLayoutStore()
  const playlistStore = usePlaylistStore()

  // --- Approved + schedule-filtered content ---
  const visibleContent = computed(() => {
    const now = new Date().toISOString()
    return contentStore.approved.filter(c => {
      if (c.validFrom && c.validFrom > now) return false
      if (c.validUntil && c.validUntil < now) return false
      return true
    })
  })

  // --- Content filtered by location (global + location-specific) ---
  const locationContent = computed(() => {
    const locId = unref(locationId)
    if (!locId) return visibleContent.value
    // Show content that is global (no locationIds or empty array) + content assigned to this location
    const location = locationStore.items.find(l => l.id === locId)
    const parentId = location?.parentId || null
    return visibleContent.value.filter(c => {
      // No locationIds = global content → show everywhere
      if (!c.locationIds || c.locationIds.length === 0) return true
      // Content assigned to this specific location
      if (c.locationIds.includes(locId)) return true
      // Content assigned to parent location (inheritance)
      if (parentId && c.locationIds.includes(parentId)) return true
      return false
    })
  })

  // --- Build news items from approved content ---
  const newsItems = computed(() => {
    return locationContent.value.map((c, i) => ({
      id: c.id,
      title: c.title,
      text: c.description || '',
      datum: new Date(c.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      kategorie: mapTagToCategory(c.tags)
    }))
  })

  // --- Build announcement cards from approved content ---
  const announcementItems = computed(() => {
    return locationContent.value.map((c, i) => ({
      id: c.id,
      title: c.title,
      text: c.description || '',
      datum: new Date(c.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      kategorie: mapTagToCategory(c.tags)
    }))
  })

  // --- Build ticker messages from approved content ---
  const tickerMessages = computed(() => {
    const fromContent = locationContent.value.map(c => c.title + (c.description ? ' – ' + c.description : ''))
    const base = getSeedTicker()
    return fromContent.length > 0 ? [...fromContent, ...base] : base
  })

  // --- Helper: convert layoutStore layout to display grid class ---
  function layoutToGridClass(layout) {
    if (!layout) return 'full'
    const c = layout.gridColumns || 1
    const r = layout.gridRows || 1
    return `custom-${c}x${r}`
  }

  // --- Helper: build CSS grid style from layout ---
  function layoutToGridStyle(layout) {
    if (!layout) return null
    const c = layout.gridColumns || 1
    const r = layout.gridRows || 1
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${c}, 1fr)`,
      gridTemplateRows: `repeat(${r}, 1fr)`,
      gap: '14px'
    }
  }

  // --- Active playlist (first one with items, or null) ---
  const activePlaylist = computed(() => {
    // Prefer playlist with highest priority that has items
    const sorted = [...playlistStore.items]
      .filter(p => p.items && p.items.length > 0)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    return sorted[0] || null
  })

  // --- Playlist-derived page durations (contentId → duration) ---
  const playlistDurations = computed(() => {
    if (!activePlaylist.value) return {}
    const map = {}
    activePlaylist.value.items.forEach(item => {
      map[item.contentId] = item.duration || 15
    })
    return map
  })

  // --- Available layouts from the Layout Editor ---
  const customLayouts = computed(() => layoutStore.items || [])

  // --- Build display pages dynamically ---
  const displayPages = computed(() => {
    // Fixed operational pages
    const pages = [
      {
        id: 'home',
        label: 'HOME',
        icon: '&#9750;',
        iconName: 'home',
        layout: 'custom',
        noZoneChrome: true,
        duration: 15,
        customGrid: { columns: 12, rows: 2 },
        zones: [
          { id: 'home-karriere', type: 'karriere', title: 'Karriere bei Blickle', gridColumn: '1 / 8', gridRow: '1 / 2' },
          { id: 'home-kantine', type: 'canteen-menu', title: 'Heute im s\'Raedle', gridColumn: '8 / 13', gridRow: '1 / 2' },
          { id: 'home-wetter', type: 'weather', title: 'Wetter', gridColumn: '1 / 5', gridRow: '2 / 3' },
          { id: 'home-news', type: 'news-feed', title: 'News', gridColumn: '5 / 13', gridRow: '2 / 3' },
        ]
      },
      {
        id: 'kantine',
        label: 'S\'RAEDLE',
        icon: '&#127860;',
        iconName: 'utensils',
        layout: 'full',
        duration: 12,
        zones: [
          { id: 'kantine-full', type: 'canteen-weekly', title: 'Speiseplan der Woche' },
        ]
      },
    ]

    // INFOS pages: paginate through all approved content
    const announcements = announcementItems.value
    const count = announcements.length
    const zonesPerPage = 6 // max 3x2 grid
    const totalInfoPages = Math.max(Math.ceil(count / zonesPerPage), 1)

    for (let pageIdx = 0; pageIdx < totalInfoPages; pageIdx++) {
      const startIdx = pageIdx * zonesPerPage
      const endIdx = Math.min(startIdx + zonesPerPage, count)
      const pageCount = endIdx - startIdx

      let infoLayout
      if (pageCount >= 5) { infoLayout = '3x2' }
      else if (pageCount >= 3) { infoLayout = '2x2' }
      else if (pageCount === 2) { infoLayout = '2x1' }
      else { infoLayout = 'full' }

      const infoZones = []
      for (let i = startIdx; i < endIdx; i++) {
        infoZones.push({
          id: `info-${i}`,
          type: 'announcement',
          title: '',
          contentIndex: i
        })
      }

      const pageNum = totalInfoPages > 1 ? ` ${pageIdx + 1}/${totalInfoPages}` : ''
      pages.push({
        id: `infos-${pageIdx}`,
        label: `INFOS${pageNum}`,
        icon: '&#9432;',
        iconName: 'info',
        layout: infoLayout,
        duration: 15,
        zones: infoZones
      })
    }

    // PRODUKTION page: production news + poster
    pages.push({
      id: 'produktion',
      label: 'PRODUKTION',
      icon: '&#9881;',
      iconName: 'factory',
      layout: '2x1',
      duration: 20,
      zones: [
        { id: 'prod-left', type: 'produktion-news', title: 'Produktionsnews' },
        { id: 'prod-right', type: 'fullscreen-media', title: 'Vision 2030', mediaUrl: '/media/Plakat_Produktion2030_V1.jpg', mediaType: 'image' },
      ]
    })

    // SOCIAL page: Facebook + LinkedIn feeds
    pages.push({
      id: 'social',
      label: 'SOCIAL',
      icon: '&#128240;',
      iconName: 'share',
      layout: 'full',
      duration: 20,
      zones: [
        { id: 'social-full', type: 'social-wall', title: 'Social Media' },
      ]
    })

    // PLAENE page
    pages.push({
      id: 'plaene',
      label: 'PLAENE',
      icon: '&#128197;',
      iconName: 'calendar',
      layout: 'full',
      duration: 12,
      zones: [
        { id: 'plaene-full', type: 'schedule-weekly', title: 'Schichtplan naechste Woche' },
      ]
    })

    // --- Fullscreen media pages (video + posters) ---
    const fullscreenMedia = getSeedFullscreenMedia()
    fullscreenMedia.forEach((media) => {
      pages.push({
        id: `media-${media.id}`,
        label: media.mediaType === 'video' ? 'VIDEO' : 'POSTER',
        icon: media.mediaType === 'video' ? '&#127909;' : '&#128444;',
        iconName: media.mediaType === 'video' ? 'video' : 'image',
        layout: 'fullscreen',
        duration: media.duration || 15,
        zones: [
          { id: `fs-${media.id}`, type: 'fullscreen-media', title: media.title, mediaUrl: media.mediaUrl, mediaType: media.mediaType }
        ]
      })
    })

    // --- Custom layout pages from Layout Editor ---
    // Add any custom layouts that aren't the default ones as additional pages
    customLayouts.value.forEach((layout, idx) => {
      // Skip the default layouts that we already represent
      if (layout.id === 'layout-default' || layout.id === 'layout-fullwidth') return

      const zoneCount = layout.zones?.length || 1
      const zoneComponents = []

      layout.zones?.forEach((zone, zIdx) => {
        // Assign content from approved items to custom layout zones
        const contentIdx = zIdx % Math.max(count, 1)
        zoneComponents.push({
          id: `custom-${layout.id}-${zIdx}`,
          type: 'announcement',
          title: zone.name || `Zone ${zIdx + 1}`,
          contentIndex: contentIdx,
          // Pass grid positioning for custom layouts
          gridColumn: `${zone.gridColumnStart} / ${zone.gridColumnEnd}`,
          gridRow: `${zone.gridRowStart} / ${zone.gridRowEnd}`,
        })
      })

      pages.push({
        id: `layout-${layout.id}`,
        label: (layout.name || 'Layout').toUpperCase().slice(0, 12),
        icon: '&#9638;',
        iconName: 'layout',
        layout: 'custom',
        duration: 15,
        customGrid: {
          columns: layout.gridColumns || 1,
          rows: layout.gridRows || 1,
        },
        zones: zoneComponents
      })
    })

    // --- Apply playlist durations to pages ---
    if (activePlaylist.value) {
      // The playlist items map to pages by order
      const playlistItems = activePlaylist.value.items
      playlistItems.forEach((pItem, idx) => {
        if (idx < pages.length) {
          pages[idx].duration = pItem.duration || 15
        }
      })
    }

    return pages
  })

  return {
    visibleContent,
    locationContent,
    newsItems,
    announcementItems,
    tickerMessages,
    displayPages,
    activePlaylist,
    playlistDurations,
    customLayouts,
  }
}

function mapTagToCategory(tags) {
  if (!tags || tags.length === 0) return 'Allgemein'
  const tag = tags[0].toLowerCase()
  if (tag.includes('sicherheit')) return 'Sicherheit'
  if (tag.includes('produktion')) return 'Produktion'
  if (tag.includes('event')) return 'Events'
  if (tag.includes('sozial')) return 'Mitarbeiter'
  if (tag.includes('neuheit')) return 'Neuheiten'
  if (tag.includes('allgemein')) return 'Allgemein'
  if (tag.includes('messe')) return 'Messen'
  if (tag.includes('nachhaltig')) return 'Nachhaltigkeit'
  if (tag.includes('organisation')) return 'Organisation'
  return tags[0].charAt(0).toUpperCase() + tags[0].slice(1)
}
