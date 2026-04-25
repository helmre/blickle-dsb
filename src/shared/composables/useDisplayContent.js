import { computed, getCurrentScope, onScopeDispose, ref, unref } from 'vue'
import { useContentStore } from '../stores/contentStore.js'
import { useScheduleStore } from '../stores/scheduleStore.js'
import { useLocationStore } from '../stores/locationStore.js'
import { useLayoutStore } from '../stores/layoutStore.js'
import { usePlaylistStore } from '../stores/playlistStore.js'
import { useDisplayPageStore } from '../stores/displayPageStore.js'
import { useDisplayProgramStore } from '../stores/displayProgramStore.js'
import { getSeedTickerMessages as getSeedTicker, getSeedFullscreenMedia } from '../utils/seedData.js'
import { getDesignerTemplate } from '../templates/registry.js'
import { normalizeLayout, zoneGridStyle } from '../utils/layoutSchema.js'
import {
  filterLocationContent,
  filterVisibleContent,
  getLocationScopeIds,
  mapTagToCategory,
  splitDisplayContent,
} from '../displayEngine/contentEligibility.js'
import {
  resolveActivePlaylist,
  resolvePlaylistDurations,
  resolvePlaylistPageEntries,
  sortPlaylistItems,
} from '../displayEngine/playlistResolver.js'
import {
  buildNavGroups,
  buildPlaylistContentPage,
  buildPreviewPage,
} from '../displayEngine/pageBuilder.js'
import { buildDisplayPageFromConfig } from '../displayEngine/displayPageBuilder.js'
import {
  buildProgramPages,
  getDefaultDisplayPrograms,
  resolveActiveDisplayProgram,
} from '../displayEngine/displayProgramRules.js'

/**
 * Composable that builds dynamic display pages from store data.
 * Bridges the gap between Admin (stores) and Display (rendering).
 *
 * Now integrates:
 * - layoutStore: Custom grid layouts from the Layout Editor
 * - playlistStore: Playlist-driven page rotation with per-page duration
 *
 * @param {string|null} locationId - Optional location filter from route param
 * @param {{ now?: Date|string|number|import('vue').Ref, previewContent?: Object|import('vue').Ref }} options - Optional simulation clock and draft preview.
 */
export function useDisplayContent(locationId = null, options = {}) {
  const contentStore = useContentStore()
  const scheduleStore = useScheduleStore()
  const locationStore = useLocationStore()
  const layoutStore = useLayoutStore()
  const playlistStore = usePlaylistStore()
  const displayPageStore = useDisplayPageStore()
  const displayProgramStore = useDisplayProgramStore()
  const internalNow = ref(Date.now())
  const usesExternalNow = Object.prototype.hasOwnProperty.call(options, 'now')
  let clockTimer = null

  if (!usesExternalNow && typeof window !== 'undefined') {
    clockTimer = window.setInterval(() => {
      internalNow.value = Date.now()
    }, options.clockIntervalMs || 30_000)

    if (getCurrentScope()) {
      onScopeDispose(() => window.clearInterval(clockTimer))
    }
  }

  const locationScopeIds = computed(() => getLocationScopeIds(unref(locationId), locationStore.items))
  const previewContent = computed(() => {
    const content = unref(options.previewContent)
    return content && typeof content === 'object' ? content : null
  })
  const currentNow = computed(() => {
    const raw = usesExternalNow ? unref(options.now) : internalNow.value
    const date = raw ? new Date(raw) : new Date()
    return Number.isNaN(date.getTime()) ? new Date() : date
  })

  // --- Approved + schedule-filtered content ---
  const visibleContent = computed(() => {
    return filterVisibleContent({
      approvedContent: contentStore.approved,
      schedules: scheduleStore.items,
      now: currentNow.value,
      locationScopeIds: locationScopeIds.value,
    })
  })

  // --- Content filtered by location (global + location-specific) ---
  const locationContent = computed(() => {
    return filterLocationContent({
      visibleContent: visibleContent.value,
      locationId: unref(locationId),
      locationScopeIds: locationScopeIds.value,
    })
  })

  // --- Content split: designer-based full-canvas vs. tile-suitable ---
  const contentBuckets = computed(() => splitDisplayContent(locationContent.value))
  const designerContent = computed(() => contentBuckets.value.designerContent)
  const tileContent = computed(() => contentBuckets.value.tileContent)

  // --- Build news items from approved content ---
  const newsItems = computed(() => {
    return tileContent.value.map((c, i) => ({
      id: c.id,
      title: c.title,
      text: c.description || '',
      datum: new Date(c.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      kategorie: mapTagToCategory(c.tags)
    }))
  })

  // --- Build announcement cards from approved content (designer content excluded) ---
  const announcementItems = computed(() => {
    return tileContent.value.map((c, i) => ({
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

  // --- Active playlist (first one with items, or null) ---
  const activePlaylist = computed(() => {
    return resolveActivePlaylist({
      playlists: playlistStore.items,
      schedules: scheduleStore.items,
      now: currentNow.value,
      locationScopeIds: locationScopeIds.value,
    })
  })

  const activePlaylistItems = computed(() => sortPlaylistItems(activePlaylist.value))

  const playlistPageEntries = computed(() => {
    return resolvePlaylistPageEntries({
      playlistItems: activePlaylistItems.value,
      locationContent: locationContent.value,
    })
  })

  // --- Playlist-derived page durations (contentId → duration) ---
  const playlistDurations = computed(() => resolvePlaylistDurations(activePlaylistItems.value))

  // --- Available layouts from the Layout Editor ---
  const customLayouts = computed(() => layoutStore.items || [])

  const displayProgramCandidates = computed(() => {
    return displayProgramStore.items?.length ? displayProgramStore.items : getDefaultDisplayPrograms()
  })

  const activeDisplayProgram = computed(() => {
    return resolveActiveDisplayProgram({
      programs: displayProgramCandidates.value,
      schedules: scheduleStore.items,
      now: currentNow.value,
      locationScopeIds: locationScopeIds.value,
    })
  })

  // --- Build display pages dynamically ---
  const pagePools = computed(() => {
    // PDF assets behind the KANTINE pages are content-driven: the admin
    // uploads a replacement PDF via ContentEditor, store persists fileUrl
    // as data-URL, and the display picks up the new file on next render.
    // Fallback to the static public file keeps the page usable if the
    // content item is missing or not yet approved.
    const speiseplanItem = contentStore.getById('content-speiseplan-aktuell')
    const snackplanItem  = contentStore.getById('content-snackplan')
    const visibleSpeiseplanItem = locationContent.value.find(item => item.id === 'content-speiseplan-aktuell')
    const visibleSnackplanItem = locationContent.value.find(item => item.id === 'content-snackplan')
    const speiseplanPdfUrl = visibleSpeiseplanItem?.fileUrl || (!speiseplanItem ? '/pdf/speiseplan-aktuell.pdf' : null)
    const snackplanPdfUrl  = visibleSnackplanItem?.fileUrl || (!snackplanItem ? '/pdf/snackplan.pdf' : null)
    const visibleContentIds = new Set(locationContent.value.map(content => content.id))

    const displayPagesById = {
      home: buildDisplayPageFromConfig(displayPageStore.getPageConfig('home', unref(locationId)), { visibleContentIds }),
    }

    const systemPages = {
      kantine: {
        id: 'kantine',
        navGroupId: 'kantine',
        label: 'SPEISEPLAN',
        icon: '&#127860;',
        iconName: 'utensils',
        layout: 'fullscreen',
        duration: 18,
        zones: [
          { id: 'kantine-pdf', type: 'pdf', title: '', pdfUrl: speiseplanPdfUrl, fit: 'cover-width' },
        ]
      },
      snackplan: {
        id: 'snackplan',
        navGroupId: 'kantine',
        label: 'SNACKPLAN',
        icon: '&#127849;',
        iconName: 'coffee',
        layout: 'fullscreen',
        duration: 15,
        zones: [
          { id: 'snackplan-pdf', type: 'pdf', title: '', pdfUrl: snackplanPdfUrl, fit: 'cover-width' },
        ]
      },
    }

    const playlistContentIds = new Set()
    const activePlaylistPages = []
    playlistPageEntries.value.forEach((entry) => {
      playlistContentIds.add(entry.content.id)
      activePlaylistPages.push(buildPlaylistContentPage(entry))
    })
    const playlistPagesById = activePlaylist.value
      ? { [activePlaylist.value.id]: activePlaylistPages }
      : {}

    // INFOS pages: paginate tile-based announcements (legacy path).
    // Designer-based content gets its own full-canvas pages below. The tile
    // pagination is only added if there is actual tile content to show —
    // otherwise it renders an empty placeholder card that ruins the vibe.
    const announcements = announcementItems.value
      .map((item, contentIndex) => ({ ...item, contentIndex }))
      .filter(item => !playlistContentIds.has(item.id))
    const count = announcements.length
    const zonesPerPage = 6 // max 3x2 grid
    const totalInfoPages = count > 0 ? Math.ceil(count / zonesPerPage) : 0

    const infoPages = []
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
        const announcement = announcements[i]
        infoZones.push({
          id: `info-${announcement.id}`,
          type: 'announcement',
          title: '',
          contentId: announcement.id,
          contentIndex: announcement.contentIndex
        })
      }

      const pageNum = totalInfoPages > 1 ? ` ${pageIdx + 1}/${totalInfoPages}` : ''
      infoPages.push({
        id: `infos-${pageIdx}`,
        navGroupId: 'infos',
        label: `INFOS${pageNum}`,
        icon: '&#9432;',
        iconName: 'info',
        layout: infoLayout,
        duration: 15,
        zones: infoZones
      })
    }

    // Designer-based content: each gets its own full-canvas page.
    // The 1920x1080 designer is rendered by TemplateRenderer via displayMode.
    const designerPages = []
    designerContent.value
      .filter(c => !playlistContentIds.has(c.id))
      .forEach((c) => {
      const tpl = getDesignerTemplate(c.templateId)
      const label = (c.title || tpl?.name || 'Designer-Inhalt')
      designerPages.push({
        id: `designer-${c.id}`,
        navGroupId: 'infos',
        label,
        icon: '&#9733;',
        iconName: 'sparkle',
        layout: 'full',
        noZoneChrome: true,
        duration: 18,
        zones: [
          { id: `designer-zone-${c.id}`, type: 'template', title: '', contentId: c.id }
        ]
      })
    })

    // PRODUKTION page: news links (full height) + Poster oben rechts + Video unten rechts
    systemPages.produktion = {
      id: 'produktion',
      navGroupId: 'produktion',
      label: 'PRODUKTION',
      icon: '&#9881;',
      iconName: 'factory',
      layout: 'custom',
      duration: 20,
      customGrid: { columns: 2, rows: 2 },
      zones: [
        { id: 'prod-left', type: 'produktion-news', title: 'Produktionsnews', gridColumn: '1 / 2', gridRow: '1 / 3' },
        { id: 'prod-poster', type: 'fullscreen-media', title: 'Vision 2030', mediaUrl: '/media/Plakat_Produktion2030_V1.jpg', mediaType: 'image', gridColumn: '2 / 3', gridRow: '1 / 2' },
        { id: 'prod-video', type: 'fullscreen-media', title: 'Meistersitzung', mediaUrl: '/media/Meistersitzung.mp4', mediaType: 'video', gridColumn: '2 / 3', gridRow: '2 / 3' },
      ]
    }

    // SHOPFLOOR page: full-bleed SFM Board (SQKTPO)
    systemPages.shopfloor = {
      id: 'shopfloor',
      navGroupId: 'shopfloor',
      label: 'SHOPFLOOR',
      icon: '&#128202;',
      iconName: 'layout',
      layout: 'full',
      noZoneChrome: true,
      duration: 22,
      zones: [
        { id: 'shopfloor-board', type: 'shop-floor-board', title: 'Shopfloor Board' },
      ]
    }

    // SOCIAL page: Facebook + LinkedIn feeds
    systemPages.social = {
      id: 'social',
      navGroupId: 'social',
      label: 'SOCIAL',
      icon: '&#128240;',
      iconName: 'share',
      layout: 'full',
      duration: 20,
      zones: [
        { id: 'social-full', type: 'social-wall', title: 'Social Media' },
      ]
    }

    // --- Fullscreen media pages (video + posters) ---
    const mediaPages = []
    const fullscreenMedia = getSeedFullscreenMedia()
    fullscreenMedia.forEach((media) => {
      mediaPages.push({
        id: `media-${media.id}`,
        navGroupId: 'medien',
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
    const layoutPages = []
    customLayouts.value.forEach((layout, idx) => {
      // Skip the default layouts that we already represent
      if (layout.id === 'layout-default' || layout.id === 'layout-fullwidth') return
      const normalizedLayout = normalizeLayout(layout)

      const zoneComponents = []

      normalizedLayout.zones?.forEach((zone, zIdx) => {
        // Assign content from approved items to custom layout zones
        const announcement = count > 0 ? announcements[zIdx % count] : null
        const gridStyle = zoneGridStyle(zone)
        zoneComponents.push({
          id: `custom-${layout.id}-${zIdx}`,
          type: 'announcement',
          title: zone.name || `Zone ${zIdx + 1}`,
          contentId: announcement?.id || null,
          contentIndex: announcement?.contentIndex ?? 0,
          gridColumn: gridStyle.gridColumn,
          gridRow: gridStyle.gridRow,
        })
      })

      layoutPages.push({
        id: `layout-${layout.id}`,
        navGroupId: 'layouts',
        label: (layout.name || 'Layout').toUpperCase().slice(0, 12),
        icon: '&#9638;',
        iconName: 'layout',
        layout: 'custom',
        duration: 15,
        customGrid: {
          columns: normalizedLayout.gridColumns,
          rows: normalizedLayout.gridRows,
        },
        zones: zoneComponents
      })
    })

    return {
      previewPages: previewContent.value ? [buildPreviewPage(previewContent.value)] : [],
      displayPages: displayPagesById,
      systemPages,
      activePlaylistPages,
      playlistPagesById,
      autoGroups: {
        infos: infoPages,
        designer: designerPages,
        medien: mediaPages,
        layouts: layoutPages,
      },
    }
  })

  const displayPages = computed(() => {
    const programmedPages = buildProgramPages(activeDisplayProgram.value, pagePools.value)
    return [
      ...pagePools.value.previewPages,
      ...programmedPages,
    ]
  })

  const navGroups = computed(() => buildNavGroups(displayPages.value))

  return {
    visibleContent,
    locationContent,
    designerContent,
    tileContent,
    newsItems,
    announcementItems,
    tickerMessages,
    displayPages,
    navGroups,
    activePlaylist,
    activePlaylistItems,
    playlistPageEntries,
    playlistDurations,
    customLayouts,
    activeDisplayProgram,
    previewContent,
    currentNow,
    locationScopeIds,
  }
}
