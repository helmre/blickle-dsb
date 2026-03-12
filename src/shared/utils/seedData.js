import { generateId } from './storage.js'

export function getSeedUsers() {
  return [
    { id: 'user-admin', name: 'Admin Blickle', email: 'admin@blickle.com', role: 'admin', locationAccess: ['loc-global'], avatar: null },
    { id: 'user-redakteur', name: 'Julia Meier', email: 'j.meier@blickle.com', role: 'editor', locationAccess: ['loc-halle1', 'loc-halle2'], avatar: null },
    { id: 'user-pruefer', name: 'Thomas Braun', email: 't.braun@blickle.com', role: 'reviewer', locationAccess: ['loc-global'], avatar: null },
    { id: 'user-viewer', name: 'Produktionsmitarbeiter', email: 'display@blickle.com', role: 'viewer', locationAccess: ['loc-halle1'], avatar: null },
  ]
}

export function getSeedLocations() {
  return [
    { id: 'loc-global', name: 'Blickle Global', parentId: null, layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
    { id: 'loc-halle1', name: 'Produktionshalle 1', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
    { id: 'loc-halle2', name: 'Produktionshalle 2', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
    { id: 'loc-verwaltung', name: 'Verwaltungsgebaeude', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
    { id: 'loc-kantine', name: 'Kantine', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
  ]
}

export function getSeedLayouts() {
  return [
    {
      id: 'layout-default',
      name: 'Standard 2x2',
      description: 'Zwei Reihen, zwei Spalten - ideal fuer die Startseite',
      gridColumns: 2,
      gridRows: 2,
      zones: [
        { id: 'zone-tl', name: 'Oben Links', gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 2 },
        { id: 'zone-tr', name: 'Oben Rechts', gridColumnStart: 2, gridColumnEnd: 3, gridRowStart: 1, gridRowEnd: 2 },
        { id: 'zone-bl', name: 'Unten Links', gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 3 },
        { id: 'zone-br', name: 'Unten Rechts', gridColumnStart: 2, gridColumnEnd: 3, gridRowStart: 2, gridRowEnd: 3 },
      ]
    },
    {
      id: 'layout-fullwidth',
      name: 'Vollbreite',
      description: 'Eine Zone ueber die gesamte Flaeche',
      gridColumns: 1,
      gridRows: 1,
      zones: [
        { id: 'zone-full', name: 'Hauptbereich', gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 1, gridRowEnd: 2 },
      ]
    }
  ]
}

export function getSeedContent() {
  const now = new Date().toISOString()
  return [
    {
      id: 'content-1', title: 'Willkommen bei Blickle', description: 'Begruessung fuer alle Mitarbeiter',
      type: 'text', tags: ['allgemein'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    },
    {
      id: 'content-2', title: 'Sicherheitshinweis: Schutzausruestung', description: 'Persoenliche Schutzausruestung ist in allen Produktionsbereichen Pflicht.',
      type: 'text', tags: ['sicherheit', 'produktion'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    },
    {
      id: 'content-3', title: 'Betriebsversammlung Q1', description: 'Am 28. Maerz findet die Betriebsversammlung statt.',
      type: 'text', tags: ['events', 'allgemein'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: '2026-03-20T00:00:00Z', validUntil: '2026-03-29T00:00:00Z',
      fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    },
    {
      id: 'content-4', title: 'Neue Raeder-Serie LKX', description: 'Produktionsstart der neuen Schwerlast-Lenkrolle LKX.',
      type: 'text', tags: ['produktion', 'neuheiten'], status: 'in_review',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    },
    {
      id: 'content-5', title: 'Sommerfest 2026', description: 'Anmeldung fuer das Blickle Sommerfest ist ab sofort moeglich!',
      type: 'text', tags: ['events', 'soziales'], status: 'draft',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: '2026-06-01T00:00:00Z', validUntil: '2026-07-15T00:00:00Z',
      fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    }
  ]
}

export function getSeedPlaylists() {
  return [
    {
      id: 'playlist-home',
      name: 'Startseite Standard',
      description: 'Standard-Playlist fuer die Startseite',
      isLoop: true,
      priority: 1,
      createdBy: 'user-admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        { id: 'pi-1', contentId: 'content-1', duration: 20, order: 1, transition: 'fade' },
        { id: 'pi-2', contentId: 'content-2', duration: 15, order: 2, transition: 'fade' },
        { id: 'pi-3', contentId: 'content-3', duration: 15, order: 3, transition: 'fade' },
      ]
    }
  ]
}

export function getSeedTemplates() {
  return [
    // ── KOMMUNIKATION ──────────────────────────────────
    {
      id: 'tpl-announcement',
      name: 'Ankuendigung',
      description: 'Allgemeine Ankuendigung mit Titel und Text',
      category: 'kommunikation',
      icon: '&#128227;',
      htmlTemplate: '<div class="tpl tpl-announcement"><div class="tpl-accent-bar"></div><h1>{{titel}}</h1><p class="tpl-body">{{text}}</p><div class="tpl-footer"><span class="tpl-date">{{datum}}</span></div></div>',
      cssTemplate: '.tpl-announcement { height:100%; display:flex; flex-direction:column; justify-content:center; padding:2.5rem 3rem; position:relative; font-family:"DM Sans",sans-serif; } .tpl-announcement .tpl-accent-bar { position:absolute; top:0; left:0; right:0; height:5px; background:#B5CC18; } .tpl-announcement h1 { font-family:"Outfit",sans-serif; font-size:2.4rem; font-weight:800; color:#E8ECF4; margin:0 0 1rem; line-height:1.2; } .tpl-announcement .tpl-body { font-size:1.2rem; color:rgba(232,236,244,0.7); line-height:1.6; flex:1; } .tpl-announcement .tpl-footer { margin-top:auto; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.06); } .tpl-announcement .tpl-date { font-size:0.85rem; color:rgba(232,236,244,0.35); }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Neue Ankuendigung', required: true },
        { key: 'text', label: 'Inhalt', type: 'textarea', defaultValue: '', required: true },
        { key: 'datum', label: 'Datum', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-urgent',
      name: 'Wichtige Mitteilung',
      description: 'Dringende Mitteilung mit rotem Akzent',
      category: 'kommunikation',
      icon: '&#10071;',
      htmlTemplate: '<div class="tpl tpl-urgent"><div class="tpl-icon">&#10071;</div><h1>{{titel}}</h1><p class="tpl-body">{{text}}</p><div class="tpl-footer"><span class="tpl-badge">WICHTIG</span><span class="tpl-date">{{datum}}</span></div></div>',
      cssTemplate: '.tpl-urgent { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 3rem; font-family:"DM Sans",sans-serif; background:linear-gradient(135deg, rgba(239,68,68,0.12) 0%, transparent 60%); } .tpl-urgent .tpl-icon { font-size:3.5rem; margin-bottom:1rem; filter:drop-shadow(0 0 20px rgba(239,68,68,0.4)); } .tpl-urgent h1 { font-family:"Outfit",sans-serif; font-size:2.2rem; font-weight:800; color:#EF4444; margin:0 0 0.8rem; } .tpl-urgent .tpl-body { font-size:1.15rem; color:rgba(232,236,244,0.75); line-height:1.6; max-width:80%; } .tpl-urgent .tpl-footer { margin-top:auto; display:flex; align-items:center; gap:1rem; padding-top:1rem; } .tpl-urgent .tpl-badge { background:rgba(239,68,68,0.2); color:#EF4444; font-size:0.7rem; font-weight:700; padding:3px 12px; border-radius:4px; letter-spacing:0.08em; } .tpl-urgent .tpl-date { font-size:0.8rem; color:rgba(232,236,244,0.3); }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Wichtige Mitteilung', required: true },
        { key: 'text', label: 'Inhalt', type: 'textarea', defaultValue: '', required: true },
        { key: 'datum', label: 'Datum', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-ceo',
      name: 'Geschaeftsfuehrung',
      description: 'Botschaft der Geschaeftsfuehrung mit Zitat-Stil',
      category: 'kommunikation',
      icon: '&#128100;',
      htmlTemplate: '<div class="tpl tpl-ceo"><div class="tpl-quote-mark">&#8220;</div><p class="tpl-quote">{{zitat}}</p><div class="tpl-author"><div class="tpl-author-info"><span class="tpl-name">{{name}}</span><span class="tpl-position">{{position}}</span></div></div></div>',
      cssTemplate: '.tpl-ceo { height:100%; display:flex; flex-direction:column; justify-content:center; padding:2.5rem 3.5rem; font-family:"DM Sans",sans-serif; } .tpl-ceo .tpl-quote-mark { font-family:Georgia,serif; font-size:6rem; line-height:0.5; color:#B5CC18; opacity:0.6; margin-bottom:0.5rem; } .tpl-ceo .tpl-quote { font-size:1.5rem; font-style:italic; color:#E8ECF4; line-height:1.6; flex:1; display:flex; align-items:center; } .tpl-ceo .tpl-author { margin-top:1.5rem; padding-top:1rem; border-top:2px solid rgba(181,204,24,0.3); display:flex; align-items:center; gap:1rem; } .tpl-ceo .tpl-name { font-weight:700; color:#E8ECF4; font-size:1.1rem; display:block; } .tpl-ceo .tpl-position { color:rgba(232,236,244,0.45); font-size:0.9rem; }',
      parameters: [
        { key: 'zitat', label: 'Botschaft / Zitat', type: 'textarea', defaultValue: '', required: true },
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'position', label: 'Position', type: 'text', defaultValue: 'Geschaeftsfuehrung', required: false },
      ]
    },

    // ── SICHERHEIT & PRODUKTION ────────────────────────
    {
      id: 'tpl-safety',
      name: 'Sicherheitshinweis',
      description: 'Auffaelliger Sicherheitshinweis mit Warnsymbol',
      category: 'sicherheit',
      icon: '&#9888;',
      htmlTemplate: '<div class="tpl tpl-safety"><div class="tpl-warning-strip"></div><div class="tpl-safety-content"><div class="tpl-icon">&#9888;</div><h1>{{titel}}</h1><p class="tpl-body">{{hinweis}}</p></div><div class="tpl-warning-strip"></div></div>',
      cssTemplate: '.tpl-safety { height:100%; display:flex; flex-direction:column; font-family:"DM Sans",sans-serif; } .tpl-safety .tpl-warning-strip { height:8px; background:repeating-linear-gradient(45deg, #F59E0B, #F59E0B 20px, #1A1F2E 20px, #1A1F2E 40px); flex-shrink:0; } .tpl-safety .tpl-safety-content { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 3rem; background:linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%); } .tpl-safety .tpl-icon { font-size:4rem; margin-bottom:1rem; filter:drop-shadow(0 0 15px rgba(245,158,11,0.4)); } .tpl-safety h1 { font-family:"Outfit",sans-serif; font-size:2.2rem; font-weight:800; color:#F59E0B; margin:0 0 0.8rem; } .tpl-safety .tpl-body { font-size:1.2rem; color:rgba(232,236,244,0.75); line-height:1.6; max-width:85%; }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Sicherheitshinweis', required: true },
        { key: 'hinweis', label: 'Hinweistext', type: 'textarea', defaultValue: '', required: true },
      ]
    },
    {
      id: 'tpl-production',
      name: 'Produktions-Update',
      description: 'Status-Anzeige fuer Produktionslinien',
      category: 'produktion',
      icon: '&#9881;',
      htmlTemplate: '<div class="tpl tpl-production"><h2 class="tpl-section-title">PRODUKTIONS-UPDATE</h2><div class="tpl-status-card"><div class="tpl-status-indicator tpl-status-{{status}}"></div><div class="tpl-status-info"><h1>{{linie}}</h1><p class="tpl-status-label">Status: <strong>{{statusText}}</strong></p><p class="tpl-reason">{{grund}}</p></div></div><div class="tpl-footer"><span class="tpl-date">{{zeitpunkt}}</span></div></div>',
      cssTemplate: '.tpl-production { height:100%; display:flex; flex-direction:column; padding:2rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-production .tpl-section-title { font-family:"Outfit",sans-serif; font-size:0.85rem; font-weight:700; color:rgba(232,236,244,0.4); letter-spacing:0.1em; margin:0 0 1.5rem; } .tpl-production .tpl-status-card { flex:1; display:flex; align-items:center; gap:2rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:2rem 2.5rem; } .tpl-production .tpl-status-indicator { width:20px; height:20px; border-radius:50%; flex-shrink:0; box-shadow:0 0 20px currentColor; } .tpl-production .tpl-status-gruen { background:#10B981; color:#10B981; } .tpl-production .tpl-status-gelb { background:#F59E0B; color:#F59E0B; } .tpl-production .tpl-status-rot { background:#EF4444; color:#EF4444; } .tpl-production h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:#E8ECF4; margin:0 0 0.3rem; } .tpl-production .tpl-status-label { font-size:1.1rem; color:rgba(232,236,244,0.6); margin:0; } .tpl-production .tpl-reason { font-size:1rem; color:rgba(232,236,244,0.4); margin:0.5rem 0 0; } .tpl-production .tpl-footer { margin-top:1rem; padding-top:0.8rem; border-top:1px solid rgba(255,255,255,0.06); } .tpl-production .tpl-date { font-size:0.8rem; color:rgba(232,236,244,0.3); }',
      parameters: [
        { key: 'linie', label: 'Linienname', type: 'text', defaultValue: 'Linie 3', required: true },
        { key: 'status', label: 'Status (gruen/gelb/rot)', type: 'select', options: ['gruen','gelb','rot'], defaultValue: 'gruen', required: true },
        { key: 'statusText', label: 'Status-Text', type: 'text', defaultValue: 'Laeuft', required: true },
        { key: 'grund', label: 'Grund/Details', type: 'text', defaultValue: '', required: false },
        { key: 'zeitpunkt', label: 'Zeitpunkt', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-kpi',
      name: 'KPI Dashboard',
      description: 'Kennzahlen-Anzeige mit grossen Zahlen',
      category: 'produktion',
      icon: '&#128200;',
      htmlTemplate: '<div class="tpl tpl-kpi"><h2 class="tpl-section-title">{{titel}}</h2><div class="tpl-kpi-grid"><div class="tpl-kpi-item"><span class="tpl-kpi-value">{{wert1}}</span><span class="tpl-kpi-label">{{label1}}</span></div><div class="tpl-kpi-item"><span class="tpl-kpi-value tpl-kpi-accent">{{wert2}}</span><span class="tpl-kpi-label">{{label2}}</span></div><div class="tpl-kpi-item"><span class="tpl-kpi-value">{{wert3}}</span><span class="tpl-kpi-label">{{label3}}</span></div></div></div>',
      cssTemplate: '.tpl-kpi { height:100%; display:flex; flex-direction:column; padding:2rem 2.5rem; font-family:"DM Sans",sans-serif; } .tpl-kpi .tpl-section-title { font-family:"Outfit",sans-serif; font-size:0.85rem; font-weight:700; color:rgba(232,236,244,0.4); letter-spacing:0.1em; text-transform:uppercase; margin:0 0 1.5rem; text-align:center; } .tpl-kpi-grid { flex:1; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; align-items:center; } .tpl-kpi-item { text-align:center; padding:1.5rem 1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; } .tpl-kpi-value { display:block; font-family:"Outfit",sans-serif; font-size:3rem; font-weight:800; color:#E8ECF4; line-height:1; margin-bottom:0.5rem; } .tpl-kpi-accent { color:#B5CC18; } .tpl-kpi-label { font-size:0.85rem; color:rgba(232,236,244,0.4); text-transform:uppercase; letter-spacing:0.05em; }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Produktionskennzahlen', required: true },
        { key: 'wert1', label: 'Wert 1', type: 'text', defaultValue: '98.5%', required: true },
        { key: 'label1', label: 'Bezeichnung 1', type: 'text', defaultValue: 'Qualitaetsrate', required: true },
        { key: 'wert2', label: 'Wert 2', type: 'text', defaultValue: '1.247', required: true },
        { key: 'label2', label: 'Bezeichnung 2', type: 'text', defaultValue: 'Stueck/Tag', required: true },
        { key: 'wert3', label: 'Wert 3', type: 'text', defaultValue: '0', required: true },
        { key: 'label3', label: 'Bezeichnung 3', type: 'text', defaultValue: 'Unfaelle', required: true },
      ]
    },

    // ── PERSONAL & RECRUITING ──────────────────────────
    {
      id: 'tpl-job',
      name: 'Stellenanzeige',
      description: 'Recruiting-Anzeige im Blickle-Design',
      category: 'personal',
      icon: '&#128188;',
      htmlTemplate: '<div class="tpl tpl-job"><div class="tpl-job-header"><span class="tpl-job-badge">WIR SUCHEN</span><h1>{{jobtitel}}</h1><p class="tpl-job-meta">{{standort}} &bull; {{eintritt}}</p></div><div class="tpl-job-body"><div class="tpl-job-points">{{anforderungen}}</div></div><div class="tpl-job-footer"><span class="tpl-job-cta">Jetzt bewerben: karriere.blickle.com</span></div></div>',
      cssTemplate: '.tpl-job { height:100%; display:flex; flex-direction:column; font-family:"DM Sans",sans-serif; } .tpl-job-header { padding:2rem 3rem 1.5rem; background:linear-gradient(135deg, rgba(181,204,24,0.1) 0%, transparent 60%); } .tpl-job .tpl-job-badge { display:inline-block; background:#B5CC18; color:#163A6C; font-size:0.7rem; font-weight:800; padding:4px 14px; border-radius:4px; letter-spacing:0.1em; margin-bottom:0.8rem; } .tpl-job h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:#E8ECF4; margin:0 0 0.5rem; } .tpl-job-meta { font-size:1rem; color:rgba(232,236,244,0.5); margin:0; } .tpl-job-body { flex:1; padding:1.5rem 3rem; } .tpl-job-points { font-size:1.1rem; color:rgba(232,236,244,0.7); line-height:2; white-space:pre-line; } .tpl-job-footer { padding:1.2rem 3rem; border-top:1px solid rgba(255,255,255,0.06); background:rgba(181,204,24,0.05); } .tpl-job-cta { font-size:0.9rem; font-weight:600; color:#B5CC18; }',
      parameters: [
        { key: 'jobtitel', label: 'Jobtitel', type: 'text', defaultValue: '', required: true },
        { key: 'standort', label: 'Standort', type: 'text', defaultValue: 'Rosenfeld', required: true },
        { key: 'eintritt', label: 'Eintritt', type: 'text', defaultValue: 'Ab sofort', required: false },
        { key: 'anforderungen', label: 'Anforderungen (eine pro Zeile)', type: 'textarea', defaultValue: '', required: true },
      ]
    },
    {
      id: 'tpl-welcome',
      name: 'Willkommen',
      description: 'Begruessung fuer neue Mitarbeiter oder Besucher',
      category: 'personal',
      icon: '&#128075;',
      htmlTemplate: '<div class="tpl tpl-welcome"><div class="tpl-welcome-icon">&#128075;</div><p class="tpl-welcome-label">HERZLICH WILLKOMMEN</p><h1>{{name}}</h1><div class="tpl-welcome-details"><p>{{abteilung}}</p><p class="tpl-welcome-date">{{startdatum}}</p></div></div>',
      cssTemplate: '.tpl-welcome { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem; font-family:"DM Sans",sans-serif; background:linear-gradient(180deg, rgba(181,204,24,0.06) 0%, transparent 50%); } .tpl-welcome-icon { font-size:4rem; margin-bottom:0.5rem; } .tpl-welcome-label { font-size:0.85rem; font-weight:700; color:#B5CC18; letter-spacing:0.15em; margin:0 0 0.5rem; } .tpl-welcome h1 { font-family:"Outfit",sans-serif; font-size:2.8rem; font-weight:800; color:#E8ECF4; margin:0 0 1rem; } .tpl-welcome-details p { font-size:1.2rem; color:rgba(232,236,244,0.6); margin:0.2rem 0; } .tpl-welcome-date { font-size:1rem; color:rgba(232,236,244,0.35); }',
      parameters: [
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'abteilung', label: 'Abteilung / Bereich', type: 'text', defaultValue: '', required: false },
        { key: 'startdatum', label: 'Startdatum / Anlass', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-jubilee',
      name: 'Jubilaeums-Glueckwunsch',
      description: 'Ehrung fuer Firmenjubilaeen',
      category: 'personal',
      icon: '&#127881;',
      htmlTemplate: '<div class="tpl tpl-jubilee"><div class="tpl-confetti">&#127881;</div><p class="tpl-jubilee-label">HERZLICHEN GLUECKWUNSCH</p><h1>{{name}}</h1><div class="tpl-jubilee-years"><span class="tpl-years-number">{{jahre}}</span><span class="tpl-years-label">Jahre bei Blickle</span></div><p class="tpl-jubilee-text">{{text}}</p></div>',
      cssTemplate: '.tpl-jubilee { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem; font-family:"DM Sans",sans-serif; background:linear-gradient(135deg, rgba(181,204,24,0.08) 0%, rgba(245,158,11,0.06) 100%); } .tpl-confetti { font-size:3rem; margin-bottom:0.5rem; } .tpl-jubilee-label { font-size:0.8rem; font-weight:700; color:#F59E0B; letter-spacing:0.12em; margin:0 0 0.3rem; } .tpl-jubilee h1 { font-family:"Outfit",sans-serif; font-size:2.5rem; font-weight:800; color:#E8ECF4; margin:0 0 1rem; } .tpl-jubilee-years { background:rgba(181,204,24,0.15); border:2px solid rgba(181,204,24,0.3); border-radius:16px; padding:1rem 2.5rem; display:inline-flex; flex-direction:column; align-items:center; margin-bottom:1rem; } .tpl-years-number { font-family:"Outfit",sans-serif; font-size:3.5rem; font-weight:800; color:#B5CC18; line-height:1; } .tpl-years-label { font-size:0.85rem; color:rgba(232,236,244,0.5); margin-top:0.2rem; } .tpl-jubilee-text { font-size:1.1rem; color:rgba(232,236,244,0.6); margin-top:0.5rem; }',
      parameters: [
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'jahre', label: 'Anzahl Jahre', type: 'text', defaultValue: '25', required: true },
        { key: 'text', label: 'Glueckwunschtext', type: 'textarea', defaultValue: 'Vielen Dank fuer Ihre Treue und Ihr Engagement!', required: false },
      ]
    },

    // ── EVENTS & SOZIALES ──────────────────────────────
    {
      id: 'tpl-event',
      name: 'Veranstaltung',
      description: 'Save-the-Date fuer Veranstaltungen',
      category: 'events',
      icon: '&#127880;',
      htmlTemplate: '<div class="tpl tpl-event"><span class="tpl-event-badge">SAVE THE DATE</span><h1>{{titel}}</h1><div class="tpl-event-details"><div class="tpl-event-detail"><span class="tpl-event-icon">&#128197;</span><span>{{datum}}</span></div><div class="tpl-event-detail"><span class="tpl-event-icon">&#128205;</span><span>{{ort}}</span></div></div><p class="tpl-event-desc">{{beschreibung}}</p></div>',
      cssTemplate: '.tpl-event { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-event-badge { display:inline-block; background:#B5CC18; color:#163A6C; font-size:0.75rem; font-weight:800; padding:5px 18px; border-radius:4px; letter-spacing:0.12em; margin-bottom:1rem; } .tpl-event h1 { font-family:"Outfit",sans-serif; font-size:2.5rem; font-weight:800; color:#E8ECF4; margin:0 0 1.2rem; } .tpl-event-details { display:flex; gap:2rem; margin-bottom:1.2rem; } .tpl-event-detail { display:flex; align-items:center; gap:0.5rem; font-size:1.15rem; color:rgba(232,236,244,0.7); } .tpl-event-icon { font-size:1.3rem; } .tpl-event-desc { font-size:1.05rem; color:rgba(232,236,244,0.5); line-height:1.5; max-width:80%; }',
      parameters: [
        { key: 'titel', label: 'Veranstaltung', type: 'text', defaultValue: '', required: true },
        { key: 'datum', label: 'Datum & Uhrzeit', type: 'text', defaultValue: '', required: true },
        { key: 'ort', label: 'Ort', type: 'text', defaultValue: 'Blickle Hauptsitz', required: false },
        { key: 'beschreibung', label: 'Beschreibung', type: 'textarea', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-countdown',
      name: 'Countdown',
      description: 'Countdown bis zu einem Event',
      category: 'events',
      icon: '&#9200;',
      htmlTemplate: '<div class="tpl tpl-countdown"><p class="tpl-countdown-label">{{label}}</p><div class="tpl-countdown-number">{{tage}}</div><p class="tpl-countdown-unit">TAGE</p><h2>{{event}}</h2><p class="tpl-countdown-date">{{datum}}</p></div>',
      cssTemplate: '.tpl-countdown { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; font-family:"DM Sans",sans-serif; } .tpl-countdown-label { font-size:0.85rem; font-weight:700; color:rgba(232,236,244,0.4); letter-spacing:0.1em; margin:0 0 1rem; } .tpl-countdown-number { font-family:"Outfit",sans-serif; font-size:8rem; font-weight:900; color:#B5CC18; line-height:1; text-shadow:0 0 40px rgba(181,204,24,0.3); } .tpl-countdown-unit { font-size:1.2rem; font-weight:700; color:rgba(232,236,244,0.4); letter-spacing:0.2em; margin:0.2rem 0 1.5rem; } .tpl-countdown h2 { font-family:"Outfit",sans-serif; font-size:1.8rem; font-weight:700; color:#E8ECF4; margin:0 0 0.3rem; } .tpl-countdown-date { font-size:1rem; color:rgba(232,236,244,0.4); margin:0; }',
      parameters: [
        { key: 'label', label: 'Label oben', type: 'text', defaultValue: 'NOCH', required: false },
        { key: 'tage', label: 'Anzahl Tage', type: 'text', defaultValue: '14', required: true },
        { key: 'event', label: 'Event-Name', type: 'text', defaultValue: '', required: true },
        { key: 'datum', label: 'Datum', type: 'text', defaultValue: '', required: false },
      ]
    },

    // ── INFORMATION & MEDIEN ───────────────────────────
    {
      id: 'tpl-training',
      name: 'Schulung / Training',
      description: 'Schulungshinweis mit allen Details',
      category: 'information',
      icon: '&#127891;',
      htmlTemplate: '<div class="tpl tpl-training"><div class="tpl-training-header"><span class="tpl-training-badge">{{pflicht}}</span><h1>{{titel}}</h1></div><div class="tpl-training-details"><div class="tpl-training-row"><span class="tpl-training-icon">&#128197;</span><span class="tpl-training-label">Datum</span><span class="tpl-training-value">{{datum}}</span></div><div class="tpl-training-row"><span class="tpl-training-icon">&#128205;</span><span class="tpl-training-label">Ort</span><span class="tpl-training-value">{{ort}}</span></div><div class="tpl-training-row"><span class="tpl-training-icon">&#128100;</span><span class="tpl-training-label">Teilnehmer</span><span class="tpl-training-value">{{teilnehmer}}</span></div></div><p class="tpl-training-note">{{hinweis}}</p></div>',
      cssTemplate: '.tpl-training { height:100%; display:flex; flex-direction:column; padding:2rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-training-header { margin-bottom:1.5rem; } .tpl-training-badge { display:inline-block; font-size:0.65rem; font-weight:800; padding:3px 12px; border-radius:4px; letter-spacing:0.1em; background:rgba(239,68,68,0.15); color:#EF4444; margin-bottom:0.8rem; } .tpl-training h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:#E8ECF4; margin:0; } .tpl-training-details { flex:1; display:flex; flex-direction:column; gap:0.8rem; } .tpl-training-row { display:flex; align-items:center; gap:1rem; padding:0.8rem 1.2rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; } .tpl-training-icon { font-size:1.3rem; width:2rem; text-align:center; flex-shrink:0; } .tpl-training-label { font-size:0.8rem; color:rgba(232,236,244,0.4); width:6rem; flex-shrink:0; } .tpl-training-value { font-size:1.05rem; color:#E8ECF4; font-weight:500; } .tpl-training-note { font-size:0.95rem; color:rgba(232,236,244,0.5); margin-top:1rem; padding-top:0.8rem; border-top:1px solid rgba(255,255,255,0.06); line-height:1.5; }',
      parameters: [
        { key: 'titel', label: 'Schulungsname', type: 'text', defaultValue: '', required: true },
        { key: 'pflicht', label: 'Pflicht/Freiwillig', type: 'text', defaultValue: 'PFLICHTSCHULUNG', required: false },
        { key: 'datum', label: 'Datum & Uhrzeit', type: 'text', defaultValue: '', required: true },
        { key: 'ort', label: 'Ort / Raum', type: 'text', defaultValue: '', required: true },
        { key: 'teilnehmer', label: 'Teilnehmerkreis', type: 'text', defaultValue: 'Alle Produktionsmitarbeiter', required: false },
        { key: 'hinweis', label: 'Zusaetzlicher Hinweis', type: 'textarea', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-embed',
      name: 'HTML / Video Embed',
      description: 'YouTube, iFrame oder eigener HTML-Code',
      category: 'medien',
      icon: '&#127909;',
      htmlTemplate: '<div class="tpl tpl-embed"><div class="tpl-embed-content">{{embedCode}}</div></div>',
      cssTemplate: '.tpl-embed { height:100%; display:flex; align-items:center; justify-content:center; padding:0; overflow:hidden; } .tpl-embed .tpl-embed-content { width:100%; height:100%; display:flex; align-items:center; justify-content:center; } .tpl-embed .tpl-embed-content iframe { width:100%; height:100%; border:none; } .tpl-embed .tpl-embed-content video { width:100%; height:100%; object-fit:contain; } .tpl-embed .tpl-embed-content img { width:100%; height:100%; object-fit:contain; }',
      parameters: [
        { key: 'embedCode', label: 'HTML / Embed Code', type: 'code', defaultValue: '<iframe src="" width="100%" height="100%"></iframe>', required: true },
      ]
    },
  ]
}

export function getSeedDisplayPages() {
  return [
    {
      id: 'home',
      label: 'HOME',
      icon: '&#9750;',
      layout: '2x2',
      zones: [
        { id: 'home-tl', type: 'schedule-table', title: 'Schichtplan' },
        { id: 'home-tr', type: 'canteen-menu', title: 'Heute in der Kantine' },
        { id: 'home-bl', type: 'weather', title: 'Wetter' },
        { id: 'home-br', type: 'news-feed', title: 'News' },
      ]
    },
    {
      id: 'kantine',
      label: 'KANTINE',
      icon: '&#127860;',
      layout: 'full',
      zones: [
        { id: 'kantine-full', type: 'canteen-weekly', title: 'Speiseplan der Woche' },
      ]
    },
    {
      id: 'infos',
      label: 'INFOS',
      icon: '&#9432;',
      layout: '3x2',
      zones: [
        { id: 'info-0', type: 'announcement', title: '' },
        { id: 'info-1', type: 'announcement', title: '' },
        { id: 'info-2', type: 'announcement', title: '' },
        { id: 'info-3', type: 'announcement', title: '' },
        { id: 'info-4', type: 'announcement', title: '' },
        { id: 'info-5', type: 'announcement', title: '' },
      ]
    },
    {
      id: 'plaene',
      label: 'PLAENE',
      icon: '&#128197;',
      layout: 'full',
      zones: [
        { id: 'plaene-full', type: 'schedule-weekly', title: 'Schichtplan naechste Woche' },
      ]
    },
  ]
}

export function getSeedScheduleData() {
  return {
    today: [
      { zeit: '06:00 - 14:00', name: 'Fruehschicht', mitarbeiter: ['M. Schmidt', 'K. Weber', 'S. Fischer', 'H. Mueller'] },
      { zeit: '14:00 - 22:00', name: 'Spaetschicht', mitarbeiter: ['A. Wagner', 'P. Becker', 'L. Hoffmann', 'R. Schulz'] },
      { zeit: '22:00 - 06:00', name: 'Nachtschicht', mitarbeiter: ['J. Koch', 'D. Richter'] },
    ],
    weekly: {
      schichten: ['Fruehschicht', 'Spaetschicht', 'Nachtschicht'],
      tage: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
      plan: [
        ['Team A', 'Team A', 'Team A', 'Team B', 'Team B'],
        ['Team B', 'Team B', 'Team C', 'Team C', 'Team C'],
        ['Team C', 'Team C', 'Team A', 'Team A', 'Team A'],
      ]
    }
  }
}

export function getSeedCanteenData() {
  const tage = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
  const gerichte = [
    { tag: 'Montag', gericht1: 'Schnitzel mit Kartoffelsalat', gericht2: 'Gemuese-Curry mit Reis', beilage: 'Tagessuppe: Tomatensuppe' },
    { tag: 'Dienstag', gericht1: 'Spaghetti Bolognese', gericht2: 'Spinat-Gnocchi', beilage: 'Tagessuppe: Gulaschsuppe' },
    { tag: 'Mittwoch', gericht1: 'Haehnchenbrust mit Gemuese', gericht2: 'Kaesespätzle', beilage: 'Tagessuppe: Kartoffelsuppe' },
    { tag: 'Donnerstag', gericht1: 'Rindergulasch mit Knoedel', gericht2: 'Gemuese-Lasagne', beilage: 'Tagessuppe: Linsensuppe' },
    { tag: 'Freitag', gericht1: 'Gebratener Fisch mit Pommes', gericht2: 'Pizza Margherita', beilage: 'Tagessuppe: Brokkolicremesuppe' },
  ]
  return { tage, gerichte }
}

export function getSeedNewsData() {
  return [
    { id: 'news-1', title: 'Blickle auf der LogiMAT 2026', text: 'Besuchen Sie uns auf der LogiMAT in Stuttgart, Halle 7, Stand D45.', datum: '15.03.2026', kategorie: 'Messen' },
    { id: 'news-2', title: '25 Jahre Jubilaeum: K. Weber', text: 'Herzlichen Glueckwunsch an Klaus Weber zum 25-jaehrigen Firmenjubilaeum!', datum: '12.03.2026', kategorie: 'Mitarbeiter' },
    { id: 'news-3', title: 'Neue Parkplatzregelung', text: 'Ab 01.04. gelten neue Parkplatzregeln. Bitte beachten Sie die Ausschilderung.', datum: '10.03.2026', kategorie: 'Organisation' },
    { id: 'news-4', title: 'Energiespar-Initiative', text: 'Gemeinsam Energie sparen: Bitte Licht und Maschinen bei Nichtgebrauch ausschalten.', datum: '08.03.2026', kategorie: 'Nachhaltigkeit' },
    { id: 'news-5', title: 'CNC-Bediener (m/w/d) gesucht', text: 'Fuer unsere Fertigung suchen wir ab sofort einen erfahrenen CNC-Bediener. Empfehlungspraemie: 1.500 EUR!', datum: '11.03.2026', kategorie: 'Stellenanzeige' },
    { id: 'news-6', title: 'Sicherheitsunterweisung Maerz', text: 'Pflichtschulung Brandschutz: 25.03. um 10:00 Uhr in der Kantine. Teilnahme fuer alle Produktionsmitarbeiter verpflichtend.', datum: '09.03.2026', kategorie: 'Sicherheit' },
  ]
}

export function getSeedTickerMessages() {
  return [
    'Herzlich Willkommen! Erfahren Sie mehr ueber das neue Digitale Schwarze Brett.',
    'Betriebsversammlung am 28. Maerz um 14:00 Uhr in der Kantine.',
    'Neue Parkplatzregelung ab 01. April - bitte Ausschilderung beachten.',
    'Blickle auf der LogiMAT 2026: Halle 7, Stand D45 - Besuchen Sie uns!',
    'Unfallfreie Tage: 127 - Weiter so!',
  ]
}

export function getSeedEmergencies() {
  return []
}

export function getSeedAuditLog() {
  const now = new Date().toISOString()
  return [
    { id: 'audit-1', action: 'system.initialized', entityType: 'system', entityId: 'system', userId: 'user-admin', timestamp: now, details: { message: 'System initialisiert mit Demo-Daten' } },
  ]
}

export function initializeSeedData() {
  const { loadData, saveData } = require('./storage.js')
  if (loadData('initialized', false)) return

  saveData('users', getSeedUsers())
  saveData('locations', getSeedLocations())
  saveData('layouts', getSeedLayouts())
  saveData('content', getSeedContent())
  saveData('playlists', getSeedPlaylists())
  saveData('templates', getSeedTemplates())
  saveData('emergencies', getSeedEmergencies())
  saveData('auditLog', getSeedAuditLog())
  saveData('initialized', true)
}
