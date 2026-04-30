import { activeSchedulesForTarget, schedulesForTarget } from './playlistResolver.js'

export const PROGRAM_ENTRY_TYPES = Object.freeze({
  DISPLAY_PAGE: 'displayPage',
  PLAYLIST: 'playlist',
  SYSTEM_PAGE: 'systemPage',
  AUTO_GROUP: 'autoGroup',
})

export const PROGRAM_ENTRY_CATALOG = Object.freeze([
  { type: PROGRAM_ENTRY_TYPES.DISPLAY_PAGE, targetId: 'home', label: 'Startseite', description: 'Konfigurierte Display-Seite mit Slots' },
  { type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'kantine', label: 'Speiseplan', description: 'PDF-Seite s\'Rädle' },
  { type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'snackplan', label: 'Snackplan', description: 'PDF-Seite Frühstück & Snacks' },
  { type: PROGRAM_ENTRY_TYPES.PLAYLIST, targetId: 'active', label: 'Aktive Playlist', description: 'Die für Zeitpunkt und Standort gewinnende Inhaltsplaylist' },
  { type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'infos', label: 'Info-Seiten', description: 'Automatisch paginierte freigegebene Inhalte' },
  { type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'designer', label: 'Designer-Inhalte', description: 'Vollflächige Inhalte aus Vorlagen' },
  { type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'produktion', label: 'Produktion 2030', description: 'Interaktive Zielbild- und Gamification-Seite' },
  { type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'shopfloor', label: 'Shopfloor-Board', description: 'SQKTPO-/Produktionsboard' },
  { type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'social', label: 'Social Wall', description: 'Social-Media-Seite' },
  { type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'medien', label: 'Medienrotation', description: 'Poster und Videos' },
  { type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'layouts', label: 'Layout-Seiten', description: 'Seiten aus dem Layout-Editor' },
])

export function getProgramEntryCatalog() {
  return PROGRAM_ENTRY_CATALOG.map(entry => ({ ...entry }))
}

export function getProgramEntryLabel(entry) {
  const match = PROGRAM_ENTRY_CATALOG.find(item =>
    item.type === entry?.type && item.targetId === entry?.targetId
  )
  if (match) return match.label
  if (entry?.type === PROGRAM_ENTRY_TYPES.PLAYLIST) return 'Playlist'
  if (entry?.type === PROGRAM_ENTRY_TYPES.DISPLAY_PAGE) return 'Display-Seite'
  if (entry?.type === PROGRAM_ENTRY_TYPES.SYSTEM_PAGE) return 'Systemseite'
  return 'Programm-Eintrag'
}

export function createProgramEntry({ type, targetId, duration = null, enabled = true } = {}) {
  return {
    id: `${type || 'entry'}-${targetId || 'new'}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    targetId,
    duration,
    transition: 'fade',
    enabled,
  }
}

export function getDefaultDisplayPrograms() {
  return [
    {
      id: 'program-standard',
      name: 'Standardprogramm',
      description: 'Die reguläre Sendeschleife für alle Displays.',
      locationIds: [],
      priority: 1,
      isActive: true,
      entries: [
        { id: 'program-entry-home', type: PROGRAM_ENTRY_TYPES.DISPLAY_PAGE, targetId: 'home', duration: 15, transition: 'fade', enabled: true },
        { id: 'program-entry-kantine', type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'kantine', duration: 18, transition: 'fade', enabled: true },
        { id: 'program-entry-produktion', type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'produktion', duration: 30, transition: 'fade', enabled: true },
        { id: 'program-entry-snackplan', type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'snackplan', duration: 15, transition: 'fade', enabled: true },
        { id: 'program-entry-playlist', type: PROGRAM_ENTRY_TYPES.PLAYLIST, targetId: 'active', duration: null, transition: 'fade', enabled: true },
        { id: 'program-entry-infos', type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'infos', duration: 15, transition: 'fade', enabled: true },
        { id: 'program-entry-designer', type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'designer', duration: 18, transition: 'fade', enabled: true },
        { id: 'program-entry-shopfloor', type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'shopfloor', duration: 22, transition: 'fade', enabled: true },
        { id: 'program-entry-social', type: PROGRAM_ENTRY_TYPES.SYSTEM_PAGE, targetId: 'social', duration: 20, transition: 'fade', enabled: true },
        { id: 'program-entry-medien', type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'medien', duration: null, transition: 'fade', enabled: true },
        { id: 'program-entry-layouts', type: PROGRAM_ENTRY_TYPES.AUTO_GROUP, targetId: 'layouts', duration: 15, transition: 'fade', enabled: true },
      ],
    },
  ]
}

export function programMatchesLocation(program, locationScopeIds = []) {
  const targetLocations = program?.locationIds || []
  if (!targetLocations.length) return true
  if (!locationScopeIds.length) return targetLocations.includes('loc-global')
  return targetLocations.some(id => locationScopeIds.includes(id))
}

export function resolveActiveDisplayProgram({ programs = [], schedules = [], now = new Date(), locationScopeIds = [] } = {}) {
  const sorted = [...programs]
    .filter(program => program.isActive !== false && program.entries?.length)
    .filter(program => programMatchesLocation(program, locationScopeIds))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const activeScheduled = sorted.filter(program =>
    activeSchedulesForTarget(schedules, 'program', program.id, now, locationScopeIds).length > 0
  )
  if (activeScheduled.length > 0) return activeScheduled[0]

  return sorted.find(program => schedulesForTarget(schedules, 'program', program.id).length === 0) || sorted[0] || null
}

function applyDuration(page, entry) {
  const duration = Number(entry.duration)
  const transition = entry.transition || page.transition
  if (!Number.isFinite(duration) || duration <= 0) return transition ? { ...page, transition } : page
  return { ...page, duration, transition }
}

export function pagesForProgramEntry(entry, pagePools = {}) {
  if (!entry || entry.enabled === false) return []

  let pages = []
  if (entry.type === PROGRAM_ENTRY_TYPES.DISPLAY_PAGE) {
    pages = pagePools.displayPages?.[entry.targetId] ? [pagePools.displayPages[entry.targetId]] : []
  } else if (entry.type === PROGRAM_ENTRY_TYPES.SYSTEM_PAGE) {
    pages = pagePools.systemPages?.[entry.targetId] ? [pagePools.systemPages[entry.targetId]] : []
  } else if (entry.type === PROGRAM_ENTRY_TYPES.PLAYLIST) {
    pages = entry.targetId === 'active'
      ? (pagePools.activePlaylistPages || [])
      : (pagePools.playlistPagesById?.[entry.targetId] || [])
  } else if (entry.type === PROGRAM_ENTRY_TYPES.AUTO_GROUP) {
    pages = pagePools.autoGroups?.[entry.targetId] || []
  }

  return pages.map(page => applyDuration(page, entry))
}

export function buildProgramPages(program, pagePools = {}) {
  return (program?.entries || []).flatMap(entry => pagesForProgramEntry(entry, pagePools))
}
