import { sanitizeRichHtml } from './sanitizeHtml.js'

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stringifyParam(value, fallback) {
  if (value === null || value === undefined) return fallback
  return String(value)
}

export function renderTemplateHtml(template, params = {}) {
  if (!template?.htmlTemplate) return ''

  let html = template.htmlTemplate

  ;(template.parameters || []).forEach((param) => {
    const key = param.key || param.name
    if (!key) return
    const fallback = param.defaultValue ?? param.default ?? `[${param.label || key}]`
    const value = stringifyParam(params[key], fallback)
    html = html.replace(new RegExp(`\\{\\{${escapeRegExp(key)}\\}\\}`, 'g'), value)
  })

  Object.keys(params || {}).forEach((key) => {
    const value = stringifyParam(params[key], `[${key}]`)
    html = html.replace(new RegExp(`\\{\\{${escapeRegExp(key)}\\}\\}`, 'g'), value)
  })

  return sanitizeRichHtml(html)
}
