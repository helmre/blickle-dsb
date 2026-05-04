export function getLayoutDeletionBlockers(layoutId, locations = []) {
  if (!layoutId) return []
  const assignedLocations = locations.filter(location => location.layoutId === layoutId)
  if (!assignedLocations.length) return []

  const visibleNames = assignedLocations
    .map(location => location.name || location.id)
    .slice(0, 3)
    .join(', ')
  const suffix = assignedLocations.length > 3 ? `, +${assignedLocations.length - 3}` : ''
  return [`${assignedLocations.length} Standorte: ${visibleNames}${suffix}`]
}
