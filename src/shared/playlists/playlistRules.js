export function isPlaylistLooping(playlist) {
  return playlist?.loop ?? playlist?.isLoop ?? true
}

export function sortPlaylistItems(playlist) {
  return [...(playlist?.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function playlistContentIds(playlist) {
  return new Set((playlist?.items || []).map(item => item.contentId))
}

export function playlistDurationSummary(items = []) {
  const totalSeconds = items.reduce((sum, item) => sum + Number(item.duration || 0), 0)
  return {
    itemCount: items.length,
    totalSeconds,
    label: `${items.length} Elemente - ${totalSeconds}s Zyklus`,
  }
}

export function movePlaylistItem(items = [], fromIndex, direction) {
  const next = [...items]
  const toIndex = fromIndex + direction
  if (fromIndex < 0 || fromIndex >= next.length || toIndex < 0 || toIndex >= next.length) return next
  const temp = next[fromIndex]
  next[fromIndex] = next[toIndex]
  next[toIndex] = temp
  return next
}

export function updatePlaylistItem(items = [], itemId, patch) {
  return items.map(item => item.id === itemId ? { ...item, ...patch } : item)
}

export function canAddContentToPlaylist(content, playlist) {
  if (!content) return { allowed: false, reason: 'Inhalt nicht gefunden' }
  if (content.status !== 'approved') return { allowed: false, reason: 'Nur freigegebene Inhalte sind displayfähig' }
  if (playlistContentIds(playlist).has(content.id)) return { allowed: false, reason: 'Bereits in der Playlist' }
  return { allowed: true, reason: 'Kann hinzugefügt werden' }
}

export function getPlaylistItemIssue(item, content) {
  if (!content) return { level: 'error', message: 'Inhalt fehlt' }
  if (content.status !== 'approved') return { level: 'warning', message: 'Nicht freigegeben' }
  return null
}

export function playlistIssueCount(items = [], getContentById = () => null) {
  return items.filter(item => getPlaylistItemIssue(item, getContentById(item.contentId))).length
}

export function filterContentForPlaylist(contentList = [], query = '') {
  const needle = query.trim().toLowerCase()
  if (!needle) return contentList
  return contentList.filter(content => String(content.title || '').toLowerCase().includes(needle))
}
