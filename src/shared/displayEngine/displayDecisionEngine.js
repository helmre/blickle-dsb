import { isCurrentlyValid } from '../utils/datetime.js'
import {
  activeSchedulesForTarget,
  schedulesForTarget,
} from './playlistResolver.js'

const STATUS_LABELS = {
  draft: 'Entwurf',
  in_review: 'Zur Prüfung',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
  archived: 'Archiviert',
}

const NAV_SOURCE_LABELS = {
  home: 'Systemseite',
  infos: 'Content-Regel',
  kantine: 'Systemseite',
  layouts: 'Layout-Regel',
  medien: 'Medienrotation',
  playlist: 'Playlist',
  preview: 'Vorschau',
  produktion: 'Systemseite',
  shopfloor: 'Systemseite',
  social: 'Systemseite',
}

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now())
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function contentMatchesLocation(content, locationId, locationScopeIds = []) {
  if (!locationId) return true
  if (!content.locationIds || content.locationIds.length === 0) return true
  return content.locationIds.some(id => locationScopeIds.includes(id))
}

function summarizeSchedule(schedule) {
  const start = schedule.startDate || 'ohne Start'
  const end = schedule.endDate || 'ohne Ende'
  const locations = schedule.locationIds?.length ? schedule.locationIds.join(', ') : 'global'
  return `${start} bis ${end} · ${locations}`
}

export function explainContentVisibility(content, {
  locationId = '',
  locationScopeIds = [],
  now = new Date(),
  schedules = [],
  visibleContentIds = null,
} = {}) {
  const currentDate = toDate(now)
  const statusPassed = content.status === 'approved'
  const validityPassed = isCurrentlyValid(content.validFrom, content.validUntil, currentDate.getTime())
  const locationPassed = contentMatchesLocation(content, locationId, locationScopeIds)
  const contentSchedules = schedulesForTarget(schedules, 'content', content.id)
  const activeSchedules = activeSchedulesForTarget(schedules, 'content', content.id, currentDate, locationScopeIds)
  const schedulePassed = contentSchedules.length === 0 || activeSchedules.length > 0
  const computedVisible = statusPassed && validityPassed && locationPassed && schedulePassed
  const visible = visibleContentIds ? visibleContentIds.has(content.id) : computedVisible

  const checks = [
    {
      key: 'status',
      label: 'Status',
      passed: statusPassed,
      text: statusPassed ? 'freigegeben' : `Status: ${STATUS_LABELS[content.status] || content.status || 'unbekannt'}`,
    },
    {
      key: 'validity',
      label: 'Gültigkeit',
      passed: validityPassed,
      text: validityPassed ? 'zeitlich gültig' : 'außerhalb des Gültigkeitszeitraums',
    },
    {
      key: 'location',
      label: 'Standort',
      passed: locationPassed,
      text: locationPassed ? 'passt zum Standort-Scope' : 'nicht für diesen Standort geplant',
    },
    {
      key: 'schedule',
      label: 'Zeitplan',
      passed: schedulePassed,
      text: contentSchedules.length === 0
        ? 'kein Zeitplan, daher dauerhaft erlaubt'
        : activeSchedules.length > 0
          ? `aktiver Zeitplan: ${summarizeSchedule(activeSchedules[0])}`
          : 'Zeitplan aktuell inaktiv',
    },
  ]

  const blockingReasons = checks
    .filter(check => !check.passed)
    .map(check => check.text)

  return {
    id: content.id,
    title: content.title || content.id,
    status: content.status,
    visible,
    reason: visible ? 'Wird angezeigt' : blockingReasons[0] || 'Nicht in aktueller Rotation',
    checks,
    scheduleCount: contentSchedules.length,
    activeScheduleCount: activeSchedules.length,
  }
}

export function buildContentDiagnostics({
  contents = [],
  locationId = '',
  locationScopeIds = [],
  now = new Date(),
  schedules = [],
  visibleContentIds = null,
} = {}) {
  return contents
    .map(content => explainContentVisibility(content, {
      locationId,
      locationScopeIds,
      now,
      schedules,
      visibleContentIds,
    }))
    .sort((a, b) => Number(b.visible) - Number(a.visible) || a.title.localeCompare(b.title))
}

export function explainPlaylistDecision({
  activePlaylist = null,
  playlists = [],
  schedules = [],
  now = new Date(),
  locationScopeIds = [],
} = {}) {
  const currentDate = toDate(now)
  const playlistsWithItems = playlists.filter(playlist => playlist.items?.length)
  const activeSchedules = activePlaylist
    ? activeSchedulesForTarget(schedules, 'playlist', activePlaylist.id, currentDate, locationScopeIds)
    : []
  const hasAnyScheduledPlaylist = playlistsWithItems.some(playlist =>
    schedulesForTarget(schedules, 'playlist', playlist.id).length > 0
  )

  if (!activePlaylist) {
    return {
      label: 'Keine aktive Playlist',
      mode: 'empty',
      reason: playlistsWithItems.length
        ? 'Keine Playlist ist für Zeitpunkt und Standort aktiv.'
        : 'Es gibt keine Playlist mit Einträgen.',
      activeSchedule: null,
      candidateCount: playlistsWithItems.length,
    }
  }

  if (activeSchedules.length > 0) {
    return {
      label: activePlaylist.name,
      mode: 'scheduled',
      reason: 'Ein aktiver Playlist-Zeitplan gewinnt für diesen Zeitpunkt und Standort.',
      activeSchedule: summarizeSchedule(activeSchedules[0]),
      candidateCount: playlistsWithItems.length,
    }
  }

  return {
    label: activePlaylist.name,
    mode: 'fallback',
    reason: hasAnyScheduledPlaylist
      ? 'Keine geplante Playlist ist jetzt aktiv, deshalb greift die Standardplaylist ohne Zeitplan.'
      : 'Keine Playlist-Zeitpläne vorhanden, deshalb läuft die Standardrotation.',
    activeSchedule: null,
    candidateCount: playlistsWithItems.length,
  }
}

export function pageContentIds(page) {
  return [...new Set((page?.zones || []).map(zone => zone.contentId).filter(Boolean))]
}

export function describeDisplayPage(page, {
  activePlaylist = null,
  contentById = new Map(),
  locationName = 'Global',
  locationScopeIds = [],
} = {}) {
  if (!page) {
    return {
      source: 'Keine Seite',
      title: 'Keine Display-Seite verfügbar',
      facts: ['Für diese Auswahl wurde keine Seite erzeugt.'],
      contentTitles: [],
    }
  }

  const ids = pageContentIds(page)
  const contentTitles = ids.map(id => contentById.get(id)?.title || id)
  const source = NAV_SOURCE_LABELS[page.navGroupId || page.id] || 'Display-Regel'
  const facts = []

  if (page.navGroupId === 'playlist') {
    facts.push(activePlaylist
      ? `Reihenfolge und Dauer kommen aus "${activePlaylist.name}".`
      : 'Playlist-Seite ohne aktive Playlist gefunden.')
  } else if (page.navGroupId === 'infos') {
    facts.push('Freigegebene Inhalte werden nach Standort, Gültigkeit und Zeitplan gefiltert.')
  } else if (page.navGroupId === 'layouts') {
    facts.push('Custom Layout aus dem Layout-Editor mit aktuell sichtbaren Inhalten.')
  } else if (page.navGroupId === 'medien') {
    facts.push('Medienseite aus der vorkonfigurierten Display-Rotation.')
  } else if (page.navGroupId === 'preview') {
    facts.push('Entwurfs-Vorschau, unabhängig vom Freigabestatus.')
  } else {
    facts.push('Systemseite der Standardrotation.')
  }

  facts.push(`Standort: ${locationName || 'Global / ungefiltert'}`)
  facts.push(`Dauer in Rotation: ${page.duration || 15}s`)

  if (locationScopeIds.length) {
    facts.push(`Standort-Scope: ${locationScopeIds.join(' > ')}`)
  }

  if (contentTitles.length) {
    facts.push(`Inhalt: ${contentTitles.join(', ')}`)
  } else {
    facts.push('Kein einzelner Content-Datensatz, sondern System-/Seed-Inhalt.')
  }

  return {
    source,
    title: page.label || page.id,
    facts,
    contentTitles,
  }
}
