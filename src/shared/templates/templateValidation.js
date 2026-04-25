const DESIGNER_REQUIRED_FIELDS = {
  'designer-demo': [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Begleittext' },
    { key: 'qr1Url', label: 'QR 1 URL', type: 'url' },
    { key: 'qr2Url', label: 'QR 2 URL', type: 'url' },
  ],
  'designer-video-news': [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Begleittext' },
    { key: 'videoUrl', label: 'Video-URL oder Datei', type: 'url' },
  ],
  'designer-job-posting': [
    { key: 'jobTitle', label: 'Jobtitel' },
    { key: 'department', label: 'Abteilung' },
    { key: 'bullets', label: 'Aufgaben', type: 'list' },
    { key: 'applyUrl', label: 'Bewerbungs-URL', type: 'url' },
    { key: 'contactName', label: 'Ansprechpartner' },
  ],
  'designer-meeting-callout': [
    { key: 'topic', label: 'Thema' },
    { key: 'location', label: 'Ort' },
    { key: 'body', label: 'Beschreibung' },
  ],
  'designer-legal-notice': [
    { key: 'headline', label: 'Titel' },
    { key: 'body', label: 'Mitteilungstext' },
    { key: 'source', label: 'Quelle' },
  ],
  'designer-room-location': [
    { key: 'headline', label: 'Headline' },
    { key: 'body', label: 'Beschreibung' },
    { key: 'buildingName', label: 'Gebäude' },
    { key: 'roomLabel', label: 'Raum' },
  ],
  'designer-employee-spotlight': [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Abteilung' },
    { key: 'quote', label: 'Zitat' },
  ],
  'designer-ceo-quote': [
    { key: 'quote', label: 'Zitat' },
    { key: 'authorName', label: 'Name' },
    { key: 'authorPosition', label: 'Funktion' },
  ],
  'designer-visitor-alert': [
    { key: 'welcome', label: 'Willkommenszeile' },
    { key: 'visitors', label: 'Besucher', type: 'list' },
  ],
  'designer-news-compact': [
    { key: 'titel', label: 'Überschrift' },
    { key: 'news1_titel', label: 'News 1 Titel' },
    { key: 'news1_text', label: 'News 1 Text' },
    { key: 'news2_titel', label: 'News 2 Titel' },
    { key: 'news2_text', label: 'News 2 Text' },
    { key: 'news3_titel', label: 'News 3 Titel' },
    { key: 'news3_text', label: 'News 3 Text' },
  ],
  'designer-project-showcase': [
    { key: 'projektname', label: 'Projektname' },
    { key: 'beschreibung', label: 'Beschreibung' },
  ],
  'designer-kpi-dashboard': [
    { key: 'titel', label: 'Titel' },
    { key: 'wert1', label: 'Wert 1' },
    { key: 'label1', label: 'Label 1' },
    { key: 'wert2', label: 'Wert 2' },
    { key: 'label2', label: 'Label 2' },
    { key: 'wert3', label: 'Wert 3' },
    { key: 'label3', label: 'Label 3' },
  ],
}

function isBlank(value) {
  if (Array.isArray(value)) return value.filter(item => !isBlank(item)).length === 0
  if (value && typeof value === 'object') return Object.keys(value).length === 0
  return String(value ?? '').trim() === ''
}

function isMediaUrlField(field) {
  const key = String(field?.key || '').toLowerCase()
  const type = String(field?.type || '').toLowerCase()
  if (['media', 'image', 'video', 'audio', 'pdf', 'file'].includes(type)) return true
  return ['image', 'video', 'media', 'poster', 'photo', 'logo', 'file', 'pdf', 'audio'].some(token => key.includes(token))
}

function isAllowedMediaDataUrl(value) {
  return /^data:(image|video|audio)\//i.test(value) || /^data:application\/pdf[;,]/i.test(value)
}

function isUrlLike(value, field = null) {
  const raw = String(value ?? '').trim()
  if (!raw) return false
  if (raw.startsWith('/')) return true
  if (raw.startsWith('data:')) return isMediaUrlField(field) && isAllowedMediaDataUrl(raw)
  try {
    const url = new URL(raw)
    const allowedProtocols = isMediaUrlField(field)
      ? ['http:', 'https:']
      : ['http:', 'https:', 'mailto:']
    return allowedProtocols.includes(url.protocol)
  } catch {
    return false
  }
}

export function requiredFieldsForTemplate(template) {
  if (!template) return []
  if (template.requiredFields?.length) return template.requiredFields
  if (DESIGNER_REQUIRED_FIELDS[template.id]) return DESIGNER_REQUIRED_FIELDS[template.id]
  return (template.parameters || [])
    .filter(param => param.required)
    .map(param => ({
      key: param.key || param.name,
      label: param.label || param.key || param.name,
      type: param.type,
    }))
}

export function validateTemplateParams(template, params = {}) {
  return requiredFieldsForTemplate(template)
    .map(field => {
      const value = params[field.key]
      if (field.type === 'url' && !isUrlLike(value, field)) {
        return { ...field, message: `${field.label} braucht eine gültige URL.` }
      }
      if ((field.type === 'list' || field.type === 'array') && isBlank(value)) {
        return { ...field, message: `${field.label} braucht mindestens einen Eintrag.` }
      }
      if (isBlank(value)) {
        return { ...field, message: `${field.label} ist ein Pflichtfeld.` }
      }
      return null
    })
    .filter(Boolean)
}

export function validateContentForPublication(content, template = null) {
  const issues = []
  if (!String(content?.title || '').trim()) {
    issues.push({ key: '__title', label: 'Titel', message: 'Titel ist ein Pflichtfeld.' })
  }

  if (content?.validFrom && content?.validUntil && content.validFrom > content.validUntil) {
    issues.push({ key: '__validity', label: 'Zeitraum', message: 'Enddatum darf nicht vor dem Startdatum liegen.' })
  }

  if (content?.type === 'pdf' && !content.fileUrl) {
    issues.push({ key: '__file', label: 'PDF-Datei', message: 'PDF-Inhalt braucht eine hochgeladene Datei.' })
  }

  if ((content?.type === 'image' || content?.type === 'video') && !content.fileUrl) {
    issues.push({ key: '__file', label: 'Mediendatei', message: 'Medieninhalt braucht eine Datei.' })
  }

  if (content?.type === 'html' && !String(content?.metadata?.embedCode || '').trim()) {
    issues.push({ key: '__embed', label: 'Embed-Code', message: 'HTML-/Embed-Inhalt braucht einen Embed-Code.' })
  }

  if (content?.templateId) {
    issues.push(...validateTemplateParams(template, content.templateParams || {}))
  }

  return issues
}
