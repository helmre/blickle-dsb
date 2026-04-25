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
  dokumente: 'Dokumente',
  feedback: 'Feedback',
  kantine: 'Kantine',
  allgemein: 'Allgemein',
  projekte: 'Projekte',
  sonstiges: 'Sonstiges',
}

export const CATALOG_TEMPLATE_ORDER = [
  'designer-announcement',
  'designer-legal-notice',
  'designer-ceo-quote',
  'designer-safety-notice',
  'designer-maintenance-alert',
  'designer-meeting-callout',
  'designer-document-qr',
  'designer-demo',
  'designer-canteen-plan',
  'designer-employee-moment',
  'designer-job-posting',
  'designer-kpi-dashboard',
  'designer-visitor-alert',
]

const HIDDEN_LEGACY_TEMPLATE_IDS = new Set([
  'tpl-announcement',
  'tpl-urgent',
  'tpl-ceo',
  'tpl-safety',
  'tpl-production',
  'tpl-kpi',
  'tpl-job',
  'tpl-welcome',
  'tpl-jubilee',
  'tpl-event',
  'tpl-countdown',
  'tpl-training',
  'tpl-embed',
  'tpl-spotlight',
  'tpl-news-compact',
  'tpl-project',
])

// Designer templates — editable via Vue component
export const DESIGNER_TEMPLATES = [
  {
    id: 'designer-announcement',
    name: 'Mitteilung',
    description: 'Allgemeine Unternehmensmitteilung mit klarer Überschrift, Text und Handlungshinweis.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#3B82F6',
    requiredFields: [
      { key: 'headline', label: 'Titel' },
      { key: 'body', label: 'Mitteilungstext' },
      { key: 'source', label: 'Quelle' },
    ],
    defaultParams: {
      variant: 'info',
      kicker: 'MITTEILUNG · BLICKLE',
      headline: 'Neue Information für alle Mitarbeitenden',
      body: 'Hier steht die kurze, verständliche Mitteilung. Wichtig: eine Botschaft pro Anzeige.',
      validFrom: '',
      source: 'Blickle Redaktion',
      ackLabel: 'Bitte beachten',
      docRef: '',
      readingTime: 'ca. 1 Min. Lesezeit',
    }
  },
  {
    id: 'designer-demo',
    name: 'Umfrage / Feedback',
    description: 'Zwei QR-Codes mit erklärendem Text. Für Feedback, Umfragen und Beteiligungsaktionen.',
    category: 'feedback',
    renderer: 'component',
    editorComponent: 'DemoEditor',
    displayComponent: 'DemoEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'body', label: 'Begleittext' },
      { key: 'qr1Url', label: 'QR 1 URL', type: 'url' },
      { key: 'qr2Url', label: 'QR 2 URL', type: 'url' },
    ],
    defaultParams: {
      kicker: 'HR · MITARBEITER-FOKUS',
      headline: 'Wie geht es dir gerade?',
      body: 'Anonyme 3-Minuten-Umfrage. Deine Meinung zählt und hilft uns, die Zusammenarbeit bei Blickle noch besser zu machen.',
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
    description: 'Hero-Video mit Kicker, Headline und optionalem Zitat-Overlay. Für Bereichs-Ankündigungen mit Handy-Video.',
    category: 'produktion',
    renderer: 'component',
    editorComponent: 'VideoNewsEditor',
    displayComponent: 'VideoNewsEditor',
    catalogHidden: true,
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'PRODUKTION · NEUE MASCHINE',
      headline: 'Neue Kantenpresse FB1',
      body: 'Ab heute im Einsatz. 40 % schneller, 30 % leiser. Demo auf Anfrage bei Meister Huber.',
      videoUrl: '',
      videoPoster: '/Blicklelogo.png',
      quote: 'Damit fahren wir endlich zweischichtig ohne Kapazitätsgrenze.',
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
      department: 'Fertigung · FB2',
      departmentIcon: 'gear',
      bullets: [
        'Bedienung automatisierter Pressen und Stanzen',
        'Qualitätsprüfung nach Werkstandard',
        'Selbstständiges Arbeiten im 3-Schicht-System',
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
    name: 'Termin / Veranstaltung',
    description: 'Terminanzeige mit Uhrzeit, Ort, Zielgruppe und optionalem Countdown.',
    category: 'events',
    renderer: 'component',
    editorComponent: 'MeetingCalloutEditor',
    displayComponent: 'MeetingCalloutEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    status: 'in-migration',
    legacyRoute: '/admin/designer-meeting-callout',
    requiredFields: [
      { key: 'topic', label: 'Thema' },
      { key: 'location', label: 'Ort' },
      { key: 'body', label: 'Beschreibung' },
    ],
    defaultParams: {
      kicker: 'EINLADUNG · BETRIEBSVERSAMMLUNG',
      topic: 'GF-Ansprache: Q2-Ausblick',
      location: 'Betriebsrestaurant',
      body: 'Alle Mitarbeiterinnen und Mitarbeiter sind herzlich eingeladen. Ca. 30 Minuten, anschließend Mittagessen.',
      audienceNote: 'Alle MA · Schichten bitte informieren',
      showCountdown: true,
      authorLabel: 'Geschäftsleitung',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-legal-notice',
    name: 'Wichtiger Hinweis',
    description: 'Formale Mitteilung mit Varianten für Information, Warnung und Dringend.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #7C2D12 0%, #78350F 100%)',
    thumbnailAccent: '#F59E0B',
    status: 'in-migration',
    legacyRoute: '/admin/designer-legal-notice',
    requiredFields: [
      { key: 'headline', label: 'Titel' },
      { key: 'body', label: 'Mitteilungstext' },
      { key: 'source', label: 'Quelle' },
    ],
    defaultParams: {
      variant: 'warn',
      kicker: 'WICHTIGE MITTEILUNG · BETRIEBSRAT',
      headline: 'Neue Betriebsvereinbarung Arbeitszeit',
      body: 'Ab dem 01.05.2026 tritt die neue Betriebsvereinbarung zum Thema Gleitzeit und mobiles Arbeiten in Kraft.',
      validFrom: '2026-05-01',
      source: 'Betriebsrat & Geschäftsleitung',
      ackLabel: 'Bitte Kenntnis im Intranet bestätigen',
      docRef: 'BV-2026-05 · Version 1.0',
      readingTime: 'ca. 3 Min. Lesezeit',
    }
  },
  {
    id: 'designer-room-location',
    name: 'Raum-Hinweis',
    description: 'Ankündigung mit Foto, Wegweiser-Karte und Öffnungszeiten.',
    category: 'hinweis',
    renderer: 'component',
    editorComponent: 'RoomLocationEditor',
    displayComponent: 'RoomLocationEditor',
    catalogHidden: true,
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    status: 'in-migration',
    legacyRoute: '/admin/designer-room-location',
    defaultParams: {
      kicker: 'NEU BEI BLICKLE',
      headline: 'Raum für Arbeitskleidung',
      subHeadline: 'Anprobe jederzeit möglich',
      body: 'Ab sofort können alle Mitarbeiterinnen und Mitarbeiter ihre Arbeitskleidung im neuen Anprobe-Raum testen und tauschen.',
      imageUrl: '/Blicklelogo.png',
      buildingName: 'Gebäude 2 · Verwaltung',
      floor: 'Erdgeschoss',
      roomLabel: 'Raum EG-12',
      directionHint: 'Vom Haupteingang rechts, 2. Tür links',
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
    id: 'designer-employee-spotlight',
    name: 'Mitarbeiter-Spotlight',
    description: 'Portrait-Foto plus Zitat und Hobby. Für die Serie #MenschenBeiBlickle.',
    category: 'mitarbeiter',
    renderer: 'component',
    editorComponent: 'EmployeeSpotlightEditor',
    displayComponent: 'EmployeeSpotlightEditor',
    catalogHidden: true,
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'MITARBEITER-SPOTLIGHT',
      name: 'Daniel Hirschler',
      department: 'Fertigung · FB2',
      quote: 'Bei Blickle zählt nicht nur was du machst, sondern wer du bist.',
      hobby: 'Motorrad-Touren durch die Schwäbische Alb',
      since: '2011',
      photoUrl: '',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-ceo-quote',
    name: 'Geschäftsleitungs-Botschaft',
    description: 'Hochwertiges Statement mit großer Typografie und optionalem Portrait.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'CeoQuoteEditor',
    displayComponent: 'CeoQuoteEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'quote', label: 'Botschaft' },
      { key: 'authorName', label: 'Name' },
      { key: 'authorPosition', label: 'Funktion' },
    ],
    defaultParams: {
      kicker: 'BOTSCHAFT DER GESCHAEFTSLEITUNG',
      quote: 'Unser Erfolg ist kein Zufall — er entsteht, weil wir als Team jeden Tag Verantwortung übernehmen und füreinander einstehen.',
      authorName: 'David Blickle',
      authorPosition: 'Geschäftsführung',
      photoUrl: '',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-visitor-alert',
    name: 'Besucher / Empfang',
    description: 'Sachlicher Hinweis auf externe Gäste für Empfang, Verwaltung und öffentliche Bereiche.',
    category: 'empfang',
    renderer: 'component',
    editorComponent: 'VisitorAlertEditor',
    displayComponent: 'VisitorAlertEditor',
    thumbnailBg: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
    thumbnailAccent: '#163A6C',
    thumbnailTheme: 'light',
    status: 'in-migration',
    legacyRoute: '/admin/designer-visitor-alert',
    requiredFields: [
      { key: 'welcome', label: 'Willkommenszeile' },
      { key: 'visitors', label: 'Besucher', type: 'list' },
    ],
    defaultParams: {
      kicker: 'GAESTE HEUTE',
      dateLabel: '2026-04-16',
      welcome: 'Willkommen in Rosenfeld',
      subline: 'Bitte freundlich grüßen',
      visitors: [],
      theme: 'light',
      accent: '#163A6C',
    }
  },
  {
    id: 'designer-news-compact',
    name: 'Kurznachrichten',
    description: 'Drei kompakte News-Karten auf einer Seite. Ideal für wochentliche Updates.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'NewsCompactEditor',
    displayComponent: 'NewsCompactEditor',
    catalogHidden: true,
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    defaultParams: {
      kicker: 'NEWS · KURZ & KNACKIG',
      titel: 'Kurznachrichten',
      news1_titel: '', news1_text: '',
      news2_titel: '', news2_text: '',
      news3_titel: '', news3_text: '',
      authorLabel: 'Blickle Redaktion',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-project-showcase',
    name: 'Projekt-Showcase',
    description: 'Große Bildfläche mit Kategorie-Pill und Überschrift. Perfekt für Success-Stories.',
    category: 'kommunikation',
    renderer: 'component',
    editorComponent: 'ProjectShowcaseEditor',
    displayComponent: 'ProjectShowcaseEditor',
    catalogHidden: true,
    thumbnailBg: 'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
    thumbnailAccent: '#10B981',
    defaultParams: {
      kicker: 'PROJEKT-SHOWCASE',
      kategorie: 'NACHHALTIGKEIT',
      projektname: '',
      beschreibung: '',
      imageUrl: '',
      authorLabel: 'Blickle Team',
      accent: '#10B981',
      theme: 'dark',
    }
  },
  {
    id: 'designer-kpi-dashboard',
    name: 'KPI / Produktionsstatus',
    description: 'Drei große Kennzahlen mit Trend-Indikatoren für Produktion, Management oder Shopfloor.',
    category: 'produktion',
    renderer: 'component',
    editorComponent: 'KpiDashboardEditor',
    displayComponent: 'KpiDashboardEditor',
    thumbnailBg: 'linear-gradient(135deg, #0A1A33 0%, #0B2442 50%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'titel', label: 'Titel' },
      { key: 'wert1', label: 'Wert 1' },
      { key: 'label1', label: 'Label 1' },
      { key: 'wert2', label: 'Wert 2' },
      { key: 'label2', label: 'Label 2' },
      { key: 'wert3', label: 'Wert 3' },
      { key: 'label3', label: 'Label 3' },
    ],
    defaultParams: {
      kicker: 'DASHBOARD · KW 16',
      titel: 'Produktionskennzahlen',
      wert1: '98.5%', label1: 'Qualitätsrate', trend1: 'up',
      wert2: '1.247', label2: 'Stück/Tag', trend2: 'up',
      wert3: '0', label3: 'Unfälle', trend3: 'flat',
      authorLabel: 'Produktion · Auto-Feed',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-safety-notice',
    name: 'Sicherheit / Pflichtunterweisung',
    description: 'Sicherheitsrelevanter Hinweis mit Warnvariante, Quelle und Handlungshinweis.',
    category: 'sicherheit',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)',
    thumbnailAccent: '#F59E0B',
    requiredFields: [
      { key: 'headline', label: 'Titel' },
      { key: 'body', label: 'Sicherheitshinweis' },
      { key: 'source', label: 'Quelle' },
    ],
    defaultParams: {
      variant: 'warn',
      kicker: 'SICHERHEIT · PFLICHTHINWEIS',
      headline: 'PSA-Pflicht in allen Produktionsbereichen',
      body: 'Schutzbrille, Sicherheitsschuhe und Gehörschutz sind verpflichtend. Bitte achtet auf euch und eure Kolleginnen und Kollegen.',
      validFrom: '',
      source: 'Arbeitssicherheit Blickle',
      ackLabel: 'Bitte Sicherheitsvorschriften beachten',
      docRef: 'ASA-INFO',
      readingTime: 'ca. 1 Min. Lesezeit',
    }
  },
  {
    id: 'designer-maintenance-alert',
    name: 'Störung / Wartung',
    description: 'Klare Statusmeldung für Anlagen, Bereiche, Zufahrten oder gesperrte Wege.',
    category: 'produktion',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)',
    thumbnailAccent: '#EF4444',
    requiredFields: [
      { key: 'headline', label: 'Titel' },
      { key: 'body', label: 'Statusmeldung' },
      { key: 'source', label: 'Quelle' },
    ],
    defaultParams: {
      variant: 'danger',
      kicker: 'STÖRUNG · WARTUNG',
      headline: 'Tor 3 vorübergehend gesperrt',
      body: 'Bitte nutzt bis zur Freigabe die ausgeschilderte Umleitung über Tor 2. Staplerverkehr ist informiert.',
      validFrom: '',
      source: 'Instandhaltung',
      ackLabel: 'Bitte Umleitung beachten',
      docRef: 'Stand: aktuell',
      readingTime: 'ca. 1 Min. Lesezeit',
    }
  },
  {
    id: 'designer-document-qr',
    name: 'Dokument / PDF mit QR',
    description: 'Dokumentenhinweis mit QR-Codes für PDF, Intranet oder Rückfragen.',
    category: 'dokumente',
    renderer: 'component',
    editorComponent: 'DemoEditor',
    displayComponent: 'DemoEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'body', label: 'Begleittext' },
      { key: 'qr1Url', label: 'Dokument-URL', type: 'url' },
    ],
    defaultParams: {
      kicker: 'DOKUMENT · INFORMATION',
      headline: 'Neues Dokument verfügbar',
      body: 'Scanne den QR-Code, um das Dokument direkt zu öffnen. Bei Fragen wende dich an die zuständige Abteilung.',
      videoUrl: '',
      videoPoster: '/Blicklelogo.png',
      qr1Url: 'https://blickle.com/dokumente/aushang.pdf',
      qr1Label: 'PDF öffnen',
      qr2Url: 'mailto:personal@blickle.com',
      qr2Label: 'Rückfrage',
      validUntil: '',
      authorLabel: 'Blickle Redaktion',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-canteen-plan',
    name: 'Kantine / Speiseplan',
    description: 'Hinweis auf Speiseplan, Snackplan oder kurzfristige Änderungen im s’Rädle.',
    category: 'kantine',
    renderer: 'component',
    editorComponent: 'DemoEditor',
    displayComponent: 'DemoEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'headline', label: 'Headline' },
      { key: 'body', label: 'Begleittext' },
      { key: 'qr1Url', label: 'Speiseplan-URL', type: 'url' },
    ],
    defaultParams: {
      kicker: 'S’RÄDLE · AKTUELL',
      headline: 'Speiseplan der Woche',
      body: 'Der aktuelle Speiseplan und Snackplan sind per QR-Code abrufbar. Änderungen werden hier kurzfristig ergänzt.',
      videoUrl: '',
      videoPoster: '/Blicklelogo.png',
      qr1Url: 'https://blickle.com/sraedle/speiseplan.pdf',
      qr1Label: 'Speiseplan',
      qr2Url: 'https://blickle.com/sraedle/snackplan.pdf',
      qr2Label: 'Snackplan',
      validUntil: '',
      authorLabel: 's’Rädle',
      accent: '#B5CC18',
      theme: 'dark',
    }
  },
  {
    id: 'designer-employee-moment',
    name: 'Mitarbeiter-Anlass',
    description: 'Willkommen, Jubiläum, Dankeschön oder interner Glückwunsch ohne extra Spezialtemplate.',
    category: 'mitarbeiter',
    renderer: 'component',
    editorComponent: 'LegalNoticeEditor',
    displayComponent: 'LegalNoticeEditor',
    thumbnailBg: 'linear-gradient(135deg, #0B1F3A 0%, #163A6C 100%)',
    thumbnailAccent: '#B5CC18',
    requiredFields: [
      { key: 'headline', label: 'Titel' },
      { key: 'body', label: 'Text' },
      { key: 'source', label: 'Quelle' },
    ],
    defaultParams: {
      variant: 'info',
      kicker: 'MENSCHEN BEI BLICKLE',
      headline: 'Herzlichen Glückwunsch zum Jubiläum',
      body: 'Vielen Dank für die langjährige Treue, den Einsatz und die Zusammenarbeit im Team.',
      validFrom: '',
      source: 'Personalabteilung',
      ackLabel: 'Wir gratulieren herzlich',
      docRef: '',
      readingTime: 'ca. 1 Min. Lesezeit',
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
// Admin-Editor-Flow (html-params Form) bleibt unverändert.

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
      headline: p.titel || 'Neue Ankündigung',
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
      headline: p.name || 'Herzlichen Glückwunsch',
      body: p.text || 'Vielen Dank für die Treue und das Engagement!',
      validFrom: '',
      source: 'Blickle Geschäftsleitung',
      ackLabel: 'Herzlichen Glückwunsch!',
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
  'tpl-spotlight': {
    displayComponent: 'EmployeeSpotlightEditor',
    mapParams: (p = {}) => ({
      kicker: 'MITARBEITER-SPOTLIGHT',
      name: p.name || '',
      department: p.abteilung || '',
      quote: p.zitat || '',
      hobby: p.hobby || '',
      since: '',
      photoUrl: p.bild || '',
      accent: '#B5CC18',
      theme: 'dark',
    })
  },
  'tpl-ceo': {
    displayComponent: 'CeoQuoteEditor',
    mapParams: (p = {}) => ({
      kicker: 'BOTSCHAFT DER GESCHAEFTSLEITUNG',
      quote: p.zitat || '',
      authorName: p.name || '',
      authorPosition: p.position || 'Geschäftsführung',
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
  'tpl-news-compact': {
    displayComponent: 'NewsCompactEditor',
    mapParams: (p = {}) => ({
      kicker: 'NEWS · KURZ & KNACKIG',
      titel: p.titel || 'Kurznachrichten',
      news1_titel: p.news1_titel || '',
      news1_text: p.news1_text || '',
      news2_titel: p.news2_titel || '',
      news2_text: p.news2_text || '',
      news3_titel: p.news3_titel || '',
      news3_text: p.news3_text || '',
      authorLabel: 'Blickle Redaktion',
      accent: '#B5CC18',
      theme: 'dark',
    })
  },
  'tpl-project': {
    displayComponent: 'ProjectShowcaseEditor',
    mapParams: (p = {}) => ({
      kicker: 'PROJEKT-SHOWCASE',
      kategorie: p.kategorie || 'PROJEKT',
      projektname: p.projektname || '',
      beschreibung: p.beschreibung || '',
      imageUrl: p.bild || '',
      authorLabel: 'Blickle Team',
      accent: '#10B981',
      theme: 'dark',
    })
  },
  'tpl-kpi': {
    displayComponent: 'KpiDashboardEditor',
    mapParams: (p = {}) => ({
      kicker: 'KENNZAHLEN · AKTUELL',
      titel: p.titel || 'Kennzahlen',
      wert1: p.wert1 || '', label1: p.label1 || '', trend1: 'up',
      wert2: p.wert2 || '', label2: p.label2 || '', trend2: 'up',
      wert3: p.wert3 || '', label3: p.label3 || '', trend3: 'flat',
      authorLabel: 'Blickle',
      accent: '#B5CC18',
      theme: 'dark',
    })
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

export function sortTemplatesForCatalog(templates = []) {
  const order = new Map(CATALOG_TEMPLATE_ORDER.map((id, index) => [id, index]))
  return [...templates].sort((a, b) => {
    const aOrder = order.has(a.id) ? order.get(a.id) : Number.MAX_SAFE_INTEGER
    const bOrder = order.has(b.id) ? order.get(b.id) : Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return String(a.name || '').localeCompare(String(b.name || ''), 'de')
  })
}

export function filterCatalogTemplates(templates = []) {
  return sortTemplatesForCatalog(templates.filter(template => template.catalogHidden !== true))
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
    catalogHidden: HIDDEN_LEGACY_TEMPLATE_IDS.has(t.id) || t.catalogHidden === true || t.isActive === false,
    isActive: t.isActive !== false,
    design: t.design || null,
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

export function getCatalogTemplates() {
  return filterCatalogTemplates(getAllTemplates())
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
    isActive: legacy.isActive !== false,
    catalogHidden: legacy.catalogHidden === true || legacy.isActive === false,
    design: legacy.design || null,
    defaultParams,
  }
}
