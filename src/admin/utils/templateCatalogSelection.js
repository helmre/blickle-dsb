export function resolveTemplateQuerySelection(query = {}, templates = []) {
  const candidate = query.template
  if (!candidate || Array.isArray(candidate)) return ''
  return templates.some(template => template.id === candidate) ? candidate : ''
}

export function resolveTemplateSelection({ currentSelectionId = '', query = {}, templates = [] } = {}) {
  const fromQuery = resolveTemplateQuerySelection(query, templates)
  if (fromQuery) return fromQuery
  if (currentSelectionId && templates.some(template => template.id === currentSelectionId)) {
    return currentSelectionId
  }
  return templates[0]?.id || ''
}
