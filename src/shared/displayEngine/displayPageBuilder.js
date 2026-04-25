import { DISPLAY_SOURCE_TYPES, getDisplayWidget } from './sourceRegistry.js'

function buildWidgetZone(slot) {
  const widget = getDisplayWidget(slot.source?.id)
  if (!widget) return null

  return {
    id: slot.id,
    type: widget.componentType,
    title: slot.source?.title || slot.label || widget.label,
    gridColumn: slot.gridColumn,
    gridRow: slot.gridRow,
  }
}

function buildContentZone(slot, { visibleContentIds = null } = {}) {
  const contentId = slot.source?.contentId || slot.source?.id
  if (!contentId) return null
  if (visibleContentIds && !visibleContentIds.has(contentId)) return null

  return {
    id: slot.id,
    type: slot.source?.renderAs || 'template',
    title: slot.source?.title || slot.label || '',
    contentId,
    gridColumn: slot.gridColumn,
    gridRow: slot.gridRow,
  }
}

function buildMediaZone(slot) {
  const mediaUrl = slot.source?.mediaUrl || slot.source?.url
  if (!mediaUrl) return null

  const mediaType = slot.source?.mediaType || slot.source?.kind || 'image'
  const type = mediaType === 'pdf' ? 'pdf' : 'fullscreen-media'

  return {
    id: slot.id,
    type,
    title: slot.source?.title || slot.label || '',
    mediaUrl: type === 'pdf' ? null : mediaUrl,
    mediaType: type === 'pdf' ? null : mediaType,
    pdfUrl: type === 'pdf' ? mediaUrl : null,
    fit: slot.source?.fit || 'contain',
    gridColumn: slot.gridColumn,
    gridRow: slot.gridRow,
  }
}

export function buildZoneFromSlot(slot, options = {}) {
  switch (slot.source?.type) {
    case DISPLAY_SOURCE_TYPES.WIDGET:
      return buildWidgetZone(slot)
    case DISPLAY_SOURCE_TYPES.CONTENT:
    case DISPLAY_SOURCE_TYPES.TEMPLATE:
      return buildContentZone(slot, options)
    case DISPLAY_SOURCE_TYPES.MEDIA:
      return buildMediaZone(slot)
    default:
      return null
  }
}

export function buildDisplayPageFromConfig(config, options = {}) {
  const zones = (config.slots || [])
    .map(slot => buildZoneFromSlot(slot, options))
    .filter(Boolean)

  const layoutType = config.layout?.type || config.layout || 'full'
  const page = {
    id: config.id,
    navGroupId: config.navGroupId || config.id,
    label: config.label || config.id,
    icon: config.icon,
    iconName: config.iconName,
    layout: layoutType,
    noZoneChrome: config.noZoneChrome,
    duration: Number(config.duration) || 15,
    zones,
  }

  if (layoutType === 'custom') {
    page.customGrid = {
      columns: Number(config.layout?.columns) || 1,
      rows: Number(config.layout?.rows) || 1,
    }
  }

  return page
}
