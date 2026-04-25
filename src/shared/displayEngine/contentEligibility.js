import { getDesignerTemplate, hasDisplayAlias } from '../templates/registry.js'
import { isCurrentlyValid } from '../utils/datetime.js'
import { activeSchedulesForTarget, schedulesForTarget } from './playlistResolver.js'

// Content that renders via a full-canvas designer component gets its own
// fullscreen page instead of being squeezed into an INFOS tile. Legacy
// templates aliased to a designer (e.g. tpl-urgent -> LegalNoticeEditor) are
// treated the same way.
export function isFullscreenDesigner(content) {
  if (!content?.templateId) return false
  if (getDesignerTemplate(content.templateId)) return true
  if (hasDisplayAlias(content.templateId)) return true
  return false
}

export function getLocationScopeIds(locationId, locations = []) {
  if (!locationId) return []
  const ids = []
  let currentId = locationId
  const seen = new Set()

  while (currentId && !seen.has(currentId)) {
    seen.add(currentId)
    ids.push(currentId)
    currentId = locations.find(location => location.id === currentId)?.parentId || null
  }

  return ids
}

export function isEmergencyTargetedForDisplay(emergency, locationId = null, locations = []) {
  if (!emergency) return false
  const targets = Array.isArray(emergency.targetLocationIds) ? emergency.targetLocationIds : []
  if (targets.length === 0) return true
  if (targets.includes('loc-global')) return true
  if (!locationId) return false

  const locationScopeIds = getLocationScopeIds(locationId, locations)
  return locationScopeIds.some(id => targets.includes(id))
}

export function filterVisibleContent({ approvedContent = [], schedules = [], now = new Date(), locationScopeIds = [] } = {}) {
  const nowTs = now.getTime()

  return approvedContent.filter(content => {
    if (!isCurrentlyValid(content.validFrom, content.validUntil, nowTs)) return false

    const targetSchedules = schedulesForTarget(schedules, 'content', content.id)
    if (targetSchedules.length === 0) return true

    return activeSchedulesForTarget(schedules, 'content', content.id, now, locationScopeIds).length > 0
  })
}

export function filterLocationContent({ visibleContent = [], locationId = null, locationScopeIds = [] } = {}) {
  if (!locationId) return visibleContent

  return visibleContent.filter(content => {
    if (!content.locationIds || content.locationIds.length === 0) return true
    return content.locationIds.some(id => locationScopeIds.includes(id))
  })
}

export function splitDisplayContent(contentList = []) {
  const designerContent = []
  const tileContent = []

  contentList.forEach(content => {
    if (isFullscreenDesigner(content)) {
      designerContent.push(content)
      return
    }

    // PDF-typed content is rendered on its own dedicated page (e.g. KANTINE),
    // never as an INFOS tile. Otherwise the same item would show up twice.
    if (content.type !== 'pdf') tileContent.push(content)
  })

  return { designerContent, tileContent }
}

export function mapTagToCategory(tags) {
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
