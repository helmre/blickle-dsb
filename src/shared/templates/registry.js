// Template Registry — Single Source of Truth for all content templates.
//
// Merges two worlds:
// 1. "Designer" templates — modern full-canvas Vue components (renderer: 'component')
// 2. "Legacy" templates from templateStore — HTML+CSS with {{placeholder}} vars (renderer: 'html-params')
//
// Each entry provides the metadata the catalog and editor need to dispatch
// to the correct rendering path.

import { useTemplateStore } from '../stores/templateStore.js'

export const CATEGORY_LABELS = {
  kommunikation: 'Kommunikation',
  produktion: 'Produktion',
  sicherheit: 'Sicherheit',
  karriere: 'Karriere',
  mitarbeiter: 'Mitarbeiter',
  events: 'Events',
  schulung: 'Schulung',
  hinweis: 'Hinweise',
  empfang: 'Empfang',
  recht: 'Rechtliches',
  allgemein: 'Allgemein',
  projekte: 'Projekte',
  sonstiges: 'Sonstiges',
}

// Designer templates — editable via Vue component
export const DESIGNER_TEMPLATES = [
  {
    id: 'designer-demo',
    name: 'QR-Ankuendigung',
    description: 'Video + 2 QR-Codes + grosse Ueberschrift. Fuer Ankuendigungen mit Aktions-Links.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'DemoEditor',
    displayComponent: 'DemoEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'HR · MITARBEITER-FOKUS',
      headline: 'Wie geht es dir gerade?',
      body: 'Anonyme 3-Minuten-Umfrage. Deine Meinung zaehlt und hilft uns, die Zusammenarbeit bei Blickle noch besser zu machen.',
      videoUrl: '',
      videoPoster: '/Blicklelogo.png',
      qr1Url: 'https://blickle.com/motivationsindex-video',
      qr1Label: 'Zum Video',
      qr2Url: 'https://blickle.com/umfrage-motivation',
      qr2Label: 'Zur Umfrage',
      validUntil: '2026-06-30',
      authorLabel: 'HR Blickle',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-video-news',
    name: 'Video-News',
    description: 'Hero-Video mit Kicker, Headline und optionalem Zitat-Overlay. Fuer Bereichs-Ankuendigungen mit Handy-Video.',
    category: 'produktion',
    renderer: 'component',
    editorComponent: 'VideoNewsEditor',
    displayComponent: 'VideoNewsEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'PRODUKTION · NEUE MASCHINE',
      headline: 'Neue Kantenpresse Halle 1',
      body: 'Ab heute im Einsatz. 40 % schneller, 30 % leiser. Demo auf Anfrage bei Meister Huber.',
      videoUrl: '',
      videoPoster: '/Blicklelogo.png',
      quote: 'Damit fahren wir endlich zweischichtig ohne Kapazitaetsgrenze.',
      quoteAuthor: 'Bernd Maier, Abteilungsleiter',
      showQuote: true,
      validUntil: '2026-05-15',
      authorLabel: 'Produktion · M. Huber',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-job-posting',
    name: 'Stellenanzeige',
    description: 'Karriere-Post mit Abteilungs-Icon, Bullets und Bewerbungs-QR.',
    category: 'karriere',
    renderer: 'component',
    editorComponent: 'JobPostingEditor',
    displayComponent: 'JobPostingEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'KARRIERE · BLICKLE',
      jobTitle: 'Produktionsmitarbeiter (m/w/d)',
      department: 'Fertigung · Halle 2',
      departmentIcon: 'gear',
      bullets: [
        'Bedienung automatisierter Pressen und Stanzen',
        'Qualitaetspruefung nach Werkstandard',
        'Selbststaendiges Arbeiten im 3-Schicht-System',
        'Teamorientiertes Arbeiten in der Fertigungsgruppe',
      ],
      perks: '38 Std./Woche · Tarif IG Metall · Betriebliche Altersvorsorge',
      applyUrl: 'https://blickle.com/karriere/produktion-halle2',
      contactName: 'Maria Schulz',
      contactEmail: 'karriere@blickle.com',
      contactPhone: '+49 7428 932 0',
      validUntil: '2026-05-31',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-meeting-callout',
    name: 'Termin-Hinweis',
    description: 'Meeting-Callout mit prominenter Uhrzeit, Ort und Live-Countdown.',
    category: 'events',
    renderer: 'component',
    editorComponent: 'MeetingCalloutEditor',
    displayComponent: 'MeetingCalloutEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    status: 'in-migration',
    legacyRoute: '/admin/designer-meeting-callout',
    defaultParams: {
      kicker: 'EINLADUNG · BETRIEBSVERSAMMLUNG',
      topic: 'GF-Ansprache: Q2-Ausblick',
      location: 'Betriebsrestaurant',
      body: 'Alle Mitarbeiterinnen und Mitarbeiter sind herzlich eingeladen. Ca. 30 Minuten, anschliessend Mittagessen.',
      audienceNote: 'Alle MA · Schichten bitte informieren',
      showCountdown: true,
      authorLabel: 'Geschaeftsleitung',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-legal-notice',
    name: 'Rechtliche Mitteilung',
    description: 'Formale Mitteilung mit Warn-Icon, Geltungsbereich und Quelle. 3 Varianten (Info/Warnung/Dringend).',
    category: 'recht',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #7C2D12 0%, #78350F 100%)',
    thumbnailAccent: '#F59E0B',
    status: 'in-migration',
    legacyRoute: '/admin/designer-legal-notice',
    defaultParams: {
      variant: 'warn',
      kicker: 'WICHTIGE MITTEILUNG · BETRIEBSRAT',
      headline: 'Neue Betriebsvereinbarung Arbeitszeit',
      body: 'Ab dem 01.05.2026 tritt die neue Betriebsvereinbarung zum Thema Gleitzeit und mobiles Arbeiten in Kraft.',
      validFrom: '2026-05-01',
      source: 'Betriebsrat & Geschaeftsleitung',
      ackLabel: 'Bitte Kenntnis im Intranet bestaetigen',
      docRef: 'BV-2026-05 · Version 1.0',
      readingTime: 'ca. 3 Min. Lesezeit',
    }
  },
  {
    id: 'designer-room-location',
    name: 'Raum-Hinweis',
    description: 'Ankuendigung mit Foto, Wegweiser-Karte und Oeffnungszeiten.',
    category: 'hinweis',
    renderer: 'component',
    editorComponent: 'RoomLocationEditor',
    displayComponent: 'RoomLocationEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    status: 'in-migration',
    legacyRoute: '/admin/designer-room-location',
    defaultParams: {
      kicker: 'NEU BEI BLICKLE',
      headline: 'Raum fuer Arbeitskleidung',
      subHeadline: 'Anprobe jederzeit moeglich',
      body: 'Ab sofort koennen alle Mitarbeiterinnen und Mitarbeiter ihre Arbeitskleidung im neuen Anprobe-Raum testen und tauschen.',
      imageUrl: '/Blicklelogo.png',
      buildingName: 'Gebaeude 2 · Verwaltung',
      floor: 'Erdgeschoss',
      roomLabel: 'Raum EG-12',
      directionHint: 'Vom Haupteingang rechts, 2. Tuer links',
      openingHours: [
        { day: 'Mo – Fr', time: '07:00 – 17:00' },
        { day: 'Sa', time: '08:00 – 12:00' },
      ],
      authorLabel: 'Personalabteilung',
      validUntil: '2026-12-31',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-ceo-quote',
    name: 'Geschaeftsleitungs-Zitat',
    description: 'Hochwertiges Zitat-Design mit grosser Typografie und optionalem Portrait. Fuer Botschaften der Geschaeftsleitung.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'CeoQuoteEditor',
    displayComponent: 'CeoQuoteEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'BOTSCHAFT DER GESCHAEFTSLEITUNG',
      quote: 'Unser Erfolg ist kein Zufall — er entsteht, weil wir als Team jeden Tag Verantwortung uebernehmen und fuereinander einstehen.',
      authorName: 'David Blickle',
      authorPosition: 'Geschaeftsfuehrung',
      photoUrl: '',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-visitor-alert',
    name: 'Besucher-Anzeige',
    description: 'Sachlicher Hinweis auf externe Gaeste fuer Empfang und oeffentliche Bereiche.',
    category: 'empfang',
    renderer: 'component',
    editorComponent: 'VisitorAlertEditor',
    displayComponent: 'VisitorAlertEditor',
    thumbnailBg: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
    thumbnailAccent: '#163A6C',
    thumbnailTheme: 'light',
    status: 'in-migration',
    legacyRoute: '/admin/designer-visitor-alert',
    defaultParams: {
      kicker: 'GAESTE HEUTE',
      dateLabel: '2026-04-16',
      welcome: 'Willkommen in Rosenfeld',
      subline: 'Bitte freundlich gruessen',
      visitors: [],
      theme: 'light',
      accent: '#163A6C',
    }
  },
]

export function getDesignerTemplate(id) {
  return DESIGNER_TEMPLATES.find(t => t.id === id) || null
}

// --- Legacy → Designer Display-Aliase ---
//
// Bestimmte klassische Templates haben visuelle Pendants unter den Designer-
// Komponenten. Statt sie komplett zu migrieren, rendern wir sie auf Display-
// Seite durch den jeweiligen Designer mit transformierten Params. Der
// Admin-Editor-Flow (html-params Form) bleibt unveraendert.

function parseGermanDateToIso(raw) {
  if (!raw) return ''
  const pad = n => String(n).padStart(2, '0')
  // Try ISO first: '2026-05-15' or '2026-05-15T18:00'
  let m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/)
  if (m) {
    return `${m[1]}-${m[2]}-${m[3]}T${m[4] || '09'}:${m[5] || '00'}`
  }
  // DD.MM.YYYY with optional time: '15.06.2025' or '15.06.2025 18:00' or '15.06.2025 · 18:00'
  m = String(raw).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[\s·,]+(\d{1,2}):(\d{2}))?/)
  if (m) {
    return `${m[3]}-${pad(m[2])}-${pad(m[1])}T${pad(m[4] || '09')}:${m[5] || '00'}`
  }
  // Fallback: 2 hours from now so countdown still works
  const d = new Date(Date.now() + 2 * 3600 * 1000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const LEGACY_DISPLAY_ALIASES = {
  'tpl-urgent': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => ({
      variant: 'danger',
      kicker: 'DRINGEND · WICHTIGE MITTEILUNG',
      headline: p.titel || 'Wichtige Mitteilung',
      body: p.text || '',
      validFrom: p.datum || '',
      source: '',
      ackLabel: 'Bitte zur Kenntnis nehmen',
      docRef: '',
      readingTime: '',
    })
  },
  'tpl-safety': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => ({
      variant: 'warn',
      kicker: 'SICHERHEIT',
      headline: p.titel || 'Sicherheitshinweis',
      body: p.hinweis || '',
      validFrom: '',
      source: '',
      ackLabel: 'Bitte Sicherheitsvorschriften beachten',
      docRef: '',
      readingTime: '',
    })
  },
  'tpl-event': {
    displayComponent: 'MeetingCalloutEditor',
    mapParams: (p = {}) => ({
      kicker: 'SAVE THE DATE',
      topic: p.titel || 'Veranstaltung',
      dateTimeValue: parseGermanDateToIso(p.datum),
      location: p.ort || 'Blickle',
      body: p.beschreibung || '',
      audienceNote: '',
      showCountdown: true,
      authorLabel: 'Blickle',
      accent: '#B5CC18',
      theme: 'dark',
    })
  },
  'tpl-announcement': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => ({
      variant: 'info',
      kicker: 'ANKUENDIGUNG · BLICKLE',
      headline: p.titel || 'Neue Ankuendigung',
      body: p.text || '',
      validFrom: '',
      source: '',
      ackLabel: p.datum ? `Datum: ${p.datum}` : 'Bitte beachten',
      docRef: '',
      readingTime: '',
    })
  },
  'tpl-countdown': {
    displayComponent: 'MeetingCalloutEditor',
    mapParams: (p = {}) => ({
      kicker: (p.label || 'NOCH') + ' · COUNTDOWN',
      topic: p.event || 'Veranstaltung',
      dateTimeValue: daysFromNowToIso(p.tage),
      location: p.datum || 'Blickle',
      body: '',
      audienceNote: '',
      showCountdown: true,
      authorLabel: 'Blickle',
      accent: '#F97316',
      theme: 'dark',
    })
  },
  'tpl-welcome': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => ({
      variant: 'info',
      kicker: 'HERZLICH WILLKOMMEN · BLICKLE',
      headline: p.name || 'Willkommen im Team',
      body: p.abteilung || '',
      validFrom: '',
      source: 'Blickle Personalabteilung',
      ackLabel: p.startdatum ? `Start: ${p.startdatum}` : 'Willkommen im Team!',
      docRef: '',
      readingTime: '',
    })
  },
  'tpl-jubilee': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => ({
      variant: 'info',
      kicker: `${p.jahre || '0'} JAHRE · JUBILAEUM`,
      headline: p.name || 'Herzlichen Glueckwunsch',
      body: p.text || 'Vielen Dank fuer die Treue und das Engagement!',
      validFrom: '',
      source: 'Blickle Geschaeftsleitung',
      ackLabel: 'Herzlichen Glueckwunsch!',
      docRef: '',
      readingTime: '',
    })
  },
  'tpl-training': {
    displayComponent: 'MeetingCalloutEditor',
    mapParams: (p = {}) => ({
      kicker: (p.pflicht || 'SCHULUNG') + ' · TERMIN',
      topic: p.titel || 'Schulung',
      dateTimeValue: parseGermanDateToIso(p.datum),
      location: p.ort || 'Blickle',
      body: p.hinweis || '',
      audienceNote: p.teilnehmer || '',
      showCountdown: true,
      authorLabel: 'Blickle',
      accent: '#3B82F6',
      theme: 'dark',
    })
  },
  'tpl-ceo': {
    displayComponent: 'CeoQuoteEditor',
    mapParams: (p = {}) => ({
      kicker: 'BOTSCHAFT DER GESCHAEFTSLEITUNG',
      quote: p.zitat || '',
      authorName: p.name || '',
      authorPosition: p.position || 'Geschaeftsfuehrung',
      photoUrl: '',
      accent: '#B5CC18',
      theme: 'dark',
    })
  },
  'tpl-production': {
    displayComponent: 'LegalNoticeEditor',
    mapParams: (p = {}) => {
      const variant = p.status === 'rot' ? 'danger' : p.status === 'gelb' ? 'warn' : 'info'
      return {
        variant,
        kicker: `PRODUKTIONS-UPDATE · ${p.linie || 'LINIE'}`,
        headline: p.statusText || 'Status-Update',
        body: p.grund || '',
        validFrom: '',
        source: '',
        ackLabel: p.zeitpunkt ? `Stand: ${p.zeitpunkt}` : 'Aktueller Status',
        docRef: '',
        readingTime: '',
      }
    }
  },
}

// Helper: synthesize an ISO datetime N days from now, so MeetingCalloutEditor
// can compute its live countdown. Noon chosen as a sensible default hour.
function daysFromNowToIso(tageRaw) {
  const tage = parseInt(tageRaw, 10)
  const days = Number.isFinite(tage) && tage >= 0 ? tage : 14
  const d = new Date(Date.now() + days * 24 * 3600 * 1000)
  d.setHours(12, 0, 0, 0)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T12:00`
}

// Returns an object describing how to render a given templateId on the
// display side. For legacy templates with a display-alias, returns the
// designer-component name plus pre-mapped params. For designer templates or
// regular legacy content, returns null → fall through to default logic.
export function getDisplayAlias(templateId, params) {
  const alias = LEGACY_DISPLAY_ALIASES[templateId]
  if (!alias) return null
  return {
    displayComponent: alias.displayComponent,
    mappedParams: alias.mapParams(params || {}),
  }
}

export function hasDisplayAlias(templateId) {
  return !!LEGACY_DISPLAY_ALIASES[templateId]
}

// Unified access — returns an array of all templates (designer + legacy).
// Use inside a component context only (needs Pinia store).
export function getAllTemplates() {
  const templateStore = useTemplateStore()
  const legacyTemplates = (templateStore.items || []).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description || `${t.category || ''} Template`,
    category: t.category || 'allgemein',
    renderer: 'html-params',
    htmlTemplate: t.htmlTemplate,
    cssTemplate: t.cssTemplate,
    parameters: t.parameters || [],
    thumbnailBg: t.thumbnailBg || 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)',
    thumbnailAccent: t.thumbnailAccent || '#B5CC18',
    defaultParams: (t.parameters || []).reduce((acc, p) => {
      const key = p.key || p.name
      acc[key] = p.defaultValue !== undefined ? p.defaultValue : (p.default || '')
      return acc
    }, {}),
  }))
  return [...DESIGNER_TEMPLATES, ...legacyTemplates]
}

export function getTemplateById(id) {
  const designer = getDesignerTemplate(id)
  if (designer) return designer
  const templateStore = useTemplateStore()
  const legacy = templateStore.getById(id)
  if (!legacy) return null
  const defaultParams = (legacy.parameters || []).reduce((acc, p) => {
    const key = p.key || p.name
    acc[key] = p.defaultValue !== undefined ? p.defaultValue : (p.default || '')
    return acc
  }, {})
  return {
    id: legacy.id,
    name: legacy.name,
    description: legacy.description || '',
    category: legacy.category || 'allgemein',
    renderer: 'html-params',
    htmlTemplate: legacy.htmlTemplate,
    cssTemplate: legacy.cssTemplate,
    parameters: legacy.parameters || [],
    defaultParams,
  }
}
