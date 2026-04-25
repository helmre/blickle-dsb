import { isScheduleActiveNow } from '../utils/datetime.js'

export function scheduleMatchesLocation(schedule, locationScopeIds = []) {
  const targetLocations = schedule?.locationIds || []
  if (!targetLocations.length) return true
  if (!locationScopeIds.length) return targetLocations.includes('loc-global')
  return targetLocations.some(id => locationScopeIds.includes(id))
}

export function schedulesForTarget(schedules = [], targetType, targetId) {
  return schedules.filter(schedule =>
    schedule.targetType === targetType &&
    schedule.targetId === targetId
  )
}

export function activeSchedulesForTarget(schedules = [], targetType, targetId, now = new Date(), locationScopeIds = []) {
  return schedules.filter(schedule =>
    schedule.targetType === targetType &&
    schedule.targetId === targetId &&
    scheduleMatchesLocation(schedule, locationScopeIds) &&
    isScheduleActiveNow(schedule, now)
  )
}

export function resolveActivePlaylist({ playlists = [], schedules = [], now = new Date(), locationScopeIds = [] } = {}) {
  const sorted = [...playlists]
    .filter(playlist => playlist.items && playlist.items.length > 0)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))

  const activeScheduled = sorted.filter(playlist =>
    activeSchedulesForTarget(schedules, 'playlist', playlist.id, now, locationScopeIds).length > 0
  )

  if (activeScheduled.length > 0) return activeScheduled[0]

  return sorted.find(playlist => schedulesForTarget(schedules, 'playlist', playlist.id).length === 0) || null
}

export function sortPlaylistItems(playlist) {
  if (!playlist) return []
  return [...(playlist.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function resolvePlaylistPageEntries({ playlistItems = [], locationContent = [] } = {}) {
  if (!playlistItems.length) return []

  const visibleById = new Map(locationContent.map(content => [content.id, content]))
  return playlistItems
    .map((item, index) => ({
      item,
      index,
      content: visibleById.get(item.contentId),
    }))
    .filter(entry => !!entry.content)
}

export function resolvePlaylistDurations(playlistItems = []) {
  const map = {}
  playlistItems.forEach(item => {
    map[item.contentId] = item.duration || 15
  })
  return map
}
