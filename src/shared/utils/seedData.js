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
    { id: 'loc-verwaltung', name: 'Verwaltungsgebäude', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
    { id: 'loc-kantine', name: 's\'Rädle', parentId: 'loc-global', layoutId: 'layout-default', timezone: 'Europe/Berlin', isActive: true, zoneAssignments: [] },
  ]
}

export function getSeedLayouts() {
  return [
    {
      id: 'layout-default',
      name: 'Standard 2x2',
      description: 'Zwei Reihen, zwei Spalten - ideal für die Startseite',
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
      description: 'Eine Zone über die gesamte Fläche',
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
    // ── Bestehende Basis-Inhalte ─────────────────────
    {
      id: 'content-1', title: 'Willkommen bei Blickle', description: 'Begrüßung für alle Mitarbeiter',
      type: 'text', tags: ['allgemein'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: null, templateParams: null, metadata: {}
    },
    {
      id: 'content-2', title: 'Sicherheitshinweis: Schutzausrüstung', description: 'PSA ist in allen Produktionsbereichen Pflicht. Schutzbrille, Sicherheitsschuhe und Gehörschutz tragen!',
      type: 'text', tags: ['sicherheit', 'produktion'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-safety', templateParams: { titel: 'PSA-Pflicht in der Produktion', hinweis: 'In allen Produktionsbereichen gilt: Schutzbrille, Sicherheitsschuhe und Gehörschutz sind Pflicht. Bitte achten Sie auf Ihre Sicherheit und die Ihrer Kolleginnen und Kollegen. Bei Fragen wenden Sie sich an Ihre Führungskraft.' }, metadata: {}
    },

    // ── Einblickle-Magazin Inhalte ───────────────────

    // 1. Vorwort David Blickle (S.3) → tpl-ceo
    {
      id: 'content-ceo-vorwort', title: 'Botschaft der Geschäftsführung', description: 'David Blickle blickt auf ein erfolgreiches Jahr zurück und gibt einen Ausblick.',
      type: 'text', tags: ['allgemein'], status: 'approved',
      createdBy: 'user-admin', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-ceo', templateParams: {
        zitat: 'Wir haben 2025 viel erreicht und sind stolz auf das, was wir gemeinsam geschafft haben. Der Zusammenhalt bei Blickle ist unsere größte Stärke. Gemeinsam gestalten wir die Zukunft.',
        name: 'David Blickle',
        position: 'Geschäftsführung'
      }, metadata: {}
    },

    // 2. Produktion im Wandel (S.10-11) → tpl-production
    {
      id: 'content-produktion-wandel', title: 'Produktion im Wandel: Matrixorganisation', description: 'Ab Januar 2026 stellen wir die Produktionsorganisation um.',
      type: 'text', tags: ['produktion'], status: 'approved',
      createdBy: 'user-admin', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-production', templateParams: {
        linie: 'Matrixorganisation 2026',
        status: 'grün',
        statusText: 'In Vorbereitung',
        grund: 'Die neue Matrixorganisation in der Produktion startet ab Januar 2026. Ziel: schnellere Entscheidungen und flexiblere Teams. Weitere Infos folgen.',
        zeitpunkt: 'Start: Januar 2026'
      }, metadata: {}
    },

    // 3. #TeamBlickle Kleidung (S.20) → tpl-announcement
    {
      id: 'content-teamblickle-kleidung', title: '#TeamBlickle Kollektion', description: 'Neue Kleidungskollektion im S\'LÄDLE erhältlich.',
      type: 'text', tags: ['allgemein', 'mitarbeiter'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-announcement', templateParams: {
        titel: '#TeamBlickle Kollektion',
        text: 'Die neue #TeamBlickle Kleidungskollektion ist da! Hoodies, T-Shirts und Caps in Blickle-Design. Erhältlich im S\'LÄDLE. Zeigt euren Teamgeist!',
        datum: 'Ab sofort verfügbar'
      }, metadata: {}
    },

    // 4. DKMS Stammzellspende (S.21) → tpl-announcement
    {
      id: 'content-dkms', title: 'DKMS: Blickle-Mitarbeiter rettet Leben', description: 'Stammzellspende eines Kollegen.',
      type: 'text', tags: ['allgemein', 'soziales'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-announcement', templateParams: {
        titel: 'Held des Alltags: Stammzellspende',
        text: 'Ein Blickle-Mitarbeiter hat durch eine Stammzellspende über die DKMS einem Menschen das Leben gerettet. Wir sind stolz und dankbar für so viel Engagement. Auch Du kannst Dich registrieren lassen!',
        datum: '2025'
      }, metadata: {}
    },

    // 5. Sommerfest & Weihnachtsfeier (S.27) → tpl-event
    {
      id: 'content-sommerfest', title: 'Blickle Sommerfest 2025', description: 'Save the Date: 10. Juli 2025',
      type: 'text', tags: ['events', 'soziales'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-event', templateParams: {
        titel: 'Blickle Sommerfest',
        datum: '10. Juli 2025, ab 15:00 Uhr',
        ort: 'Blickle Hauptsitz Rosenfeld',
        beschreibung: 'Für alle Mitarbeiterinnen und Mitarbeiter mit Familie. Essen, Trinken, Live-Musik und gute Laune!'
      }, metadata: {}
    },

    // 6. Firmenlauf Balingen (S.22) → tpl-event
    {
      id: 'content-firmenlauf', title: 'Firmenlauf Balingen: Top-Ergebnis!', description: 'Über 60 Blickle-Läufer am Start.',
      type: 'text', tags: ['events', 'soziales'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-event', templateParams: {
        titel: 'Firmenlauf Balingen',
        datum: '2025',
        ort: 'Balingen',
        beschreibung: 'Mit über 60 Läuferinnen und Läufern war Blickle stark vertreten. Highlight: HBW-Sieg in der Firmenwertung! Danke an alle Teilnehmer!'
      }, metadata: {}
    },

    // 7. Jubilare (S.22) → tpl-jubilee
    {
      id: 'content-jubilare', title: 'Unsere Jubilare', description: 'Herzlichen Glückwunsch zum Firmenjubiläum!',
      type: 'text', tags: ['mitarbeiter', 'soziales'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-jubilee', templateParams: {
        name: 'Unsere Jubilare 2025',
        jahre: '25+',
        text: 'Herzlichen Glückwunsch an alle Kolleginnen und Kollegen, die dieses Jahr ihr 25- oder 40-jähriges Firmenjubiläum bei Blickle feiern. Danke für Eure Treue!'
      }, metadata: {}
    },

    // 8. Neue Mitarbeitende (S.25-27) → tpl-welcome
    {
      id: 'content-neue-mitarbeiter', title: 'Willkommen im Team!', description: 'Über 30 neue Kolleginnen und Kollegen sind bei Blickle gestartet.',
      type: 'text', tags: ['mitarbeiter'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-welcome', templateParams: {
        name: '30+ neue Kolleg:innen',
        abteilung: 'Produktion, Verwaltung, IT & mehr',
        startdatum: 'Willkommen bei Blickle!'
      }, metadata: {}
    },

    // 9. Social Media Stats (S.9) → tpl-kpi
    {
      id: 'content-social-stats', title: 'Social Media Reichweite', description: 'Blickle wächst auch digital.',
      type: 'text', tags: ['allgemein'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-kpi', templateParams: {
        titel: 'SOCIAL MEDIA REICHWEITE',
        wert1: '15.734',
        label1: 'Follower',
        wert2: '2.1 Mio',
        label2: 'Impressionen',
        wert3: '186',
        label3: 'Beiträge'
      }, metadata: {}
    },

    // 10. Mitarbeiter-Spotlight: Daniel Hirschler (S.23) → tpl-spotlight (NEU)
    {
      id: 'content-spotlight-pilot', title: 'Spotlight: Daniel Hirschler', description: 'Unser Pilot bei Blickle.',
      type: 'text', tags: ['mitarbeiter'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-spotlight', templateParams: {
        name: 'Daniel Hirschler',
        abteilung: 'Produktion',
        hobby: 'Hobbypilot - fliegt in seiner Freizeit über die Schwäbische Alb',
        zitat: 'Ob am Boden oder in der Luft - Präzision und Teamwork sind überall gefragt.',
        bild: '/content/einblickle/produktion-wandel.jpg'
      }, metadata: {}
    },

    // 11. Kurznachrichten (S.19-21) → tpl-news-compact (NEU)
    {
      id: 'content-kurznachrichten', title: 'Kurznachrichten', description: 'Kompakte News aus dem Unternehmen.',
      type: 'text', tags: ['allgemein'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-news-compact', templateParams: {
        titel: 'KURZNACHRICHTEN',
        news1_titel: '5 Jahre ErgoMove',
        news1_text: 'Unser ergonomischer Antrieb feiert 5-jähriges Jubiläum. Über 10.000 Einheiten wurden weltweit verkauft.',
        news2_titel: '100 Jahre Boudrant',
        news2_text: 'Unser französischer Partner Boudrant feiert 100-jähriges Bestehen. Herzlichen Glückwunsch!',
        news3_titel: 'Lean-Arbeitskreis gestartet',
        news3_text: 'Der neue Lean-Arbeitskreis trifft sich regelmäßig, um Prozesse in der Produktion zu verbessern.'
      }, metadata: {}
    },

    // 12. Projekt Frida Hochbeet (S.18) → tpl-project (NEU)
    {
      id: 'content-projekt-frida', title: 'Projekt: Frida Hochbeet', description: 'Nachhaltiges Mitarbeiter-Projekt.',
      type: 'text', tags: ['nachhaltigkeit', 'soziales'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-project', templateParams: {
        projektname: 'Frida Hochbeet',
        beschreibung: 'Mitarbeiter haben gemeinsam Hochbeete für den Außenbereich gebaut. Frisches Gemüse und Kräuter fürs s\'Rädle - nachhaltig und selbst angebaut!',
        kategorie: 'NACHHALTIGKEIT',
        bild: '/content/einblickle/projekte.jpg'
      }, metadata: {}
    },

    // 13. Martin Strobel Besuch (S.8) → tpl-announcement
    {
      id: 'content-strobel', title: 'Martin Strobel zu Gast', description: 'Ex-Handball-Nationalspieler besucht Blickle.',
      type: 'text', tags: ['events'], status: 'approved',
      createdBy: 'user-redakteur', createdAt: now, updatedAt: now,
      validFrom: null, validUntil: null, fileUrl: null, mimeType: null, fileSizeBytes: 0, thumbnailUrl: null,
      templateId: 'tpl-announcement', templateParams: {
        titel: 'Martin Strobel bei Blickle',
        text: 'Ex-Handball-Nationalspieler Martin Strobel war zu Gast bei Blickle. In einem inspirierenden Vortrag sprach er über Teamgeist, Motivation und den Umgang mit Rückschlägen.',
        datum: '2025'
      }, metadata: {}
    },
  ]
}

export function getSeedPlaylists() {
  return [
    {
      id: 'playlist-home',
      name: 'Startseite Standard',
      description: 'Standard-Playlist für die Startseite',
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
      name: 'Ankündigung',
      description: 'Allgemeine Ankündigung mit Titel und Text',
      category: 'kommunikation',
      icon: '&#128227;',
      htmlTemplate: '<div class="tpl tpl-announcement"><div class="tpl-accent-bar"></div><h1>{{titel}}</h1><p class="tpl-body">{{text}}</p><div class="tpl-footer"><span class="tpl-date">{{datum}}</span></div></div>',
      cssTemplate: '.tpl-announcement { height:100%; display:flex; flex-direction:column; justify-content:center; padding:2.5rem 3rem; position:relative; font-family:"DM Sans",sans-serif; } .tpl-announcement .tpl-accent-bar { position:absolute; top:0; left:0; right:0; height:5px; background:var(--d-accent, #B5CC18); } .tpl-announcement h1 { font-family:"Outfit",sans-serif; font-size:2.4rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 1rem; line-height:1.2; } .tpl-announcement .tpl-body { font-size:1.2rem; color:var(--d-text-body, rgba(232,236,244,0.7)); line-height:1.6; flex:1; } .tpl-announcement .tpl-footer { margin-top:auto; padding-top:1rem; border-top:1px solid var(--d-border-subtle, rgba(255,255,255,0.06)); } .tpl-announcement .tpl-date { font-size:0.85rem; color:var(--d-text-faint, rgba(232,236,244,0.35)); }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Neue Ankündigung', required: true },
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
      cssTemplate: '.tpl-urgent { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 3rem; font-family:"DM Sans",sans-serif; background:linear-gradient(135deg, rgba(239,68,68,0.12) 0%, transparent 60%); } .tpl-urgent .tpl-icon { font-size:3.5rem; margin-bottom:1rem; filter:drop-shadow(0 0 20px rgba(239,68,68,0.4)); } .tpl-urgent h1 { font-family:"Outfit",sans-serif; font-size:2.2rem; font-weight:800; color:#EF4444; margin:0 0 0.8rem; } .tpl-urgent .tpl-body { font-size:1.15rem; color:var(--d-text-body, rgba(232,236,244,0.75)); line-height:1.6; max-width:80%; } .tpl-urgent .tpl-footer { margin-top:auto; display:flex; align-items:center; gap:1rem; padding-top:1rem; } .tpl-urgent .tpl-badge { background:rgba(239,68,68,0.2); color:#EF4444; font-size:0.7rem; font-weight:700; padding:3px 12px; border-radius:4px; letter-spacing:0.08em; } .tpl-urgent .tpl-date { font-size:0.8rem; color:var(--d-text-faint, rgba(232,236,244,0.3)); }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Wichtige Mitteilung', required: true },
        { key: 'text', label: 'Inhalt', type: 'textarea', defaultValue: '', required: true },
        { key: 'datum', label: 'Datum', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-ceo',
      name: 'Geschäftsführung',
      description: 'Botschaft der Geschäftsführung mit Zitat-Stil',
      category: 'kommunikation',
      icon: '&#128100;',
      htmlTemplate: '<div class="tpl tpl-ceo"><div class="tpl-quote-mark">&#8220;</div><p class="tpl-quote">{{zitat}}</p><div class="tpl-author"><div class="tpl-author-info"><span class="tpl-name">{{name}}</span><span class="tpl-position">{{position}}</span></div></div></div>',
      cssTemplate: '.tpl-ceo { height:100%; display:flex; flex-direction:column; justify-content:center; padding:2.5rem 3.5rem; font-family:"DM Sans",sans-serif; } .tpl-ceo .tpl-quote-mark { font-family:Georgia,serif; font-size:6rem; line-height:0.5; color:var(--d-accent, #B5CC18); opacity:0.6; margin-bottom:0.5rem; } .tpl-ceo .tpl-quote { font-size:1.5rem; font-style:italic; color:var(--d-text, #E8ECF4); line-height:1.6; flex:1; display:flex; align-items:center; } .tpl-ceo .tpl-author { margin-top:1.5rem; padding-top:1rem; border-top:2px solid var(--d-border-accent, rgba(181,204,24,0.3)); display:flex; align-items:center; gap:1rem; } .tpl-ceo .tpl-name { font-weight:700; color:var(--d-text, #E8ECF4); font-size:1.1rem; display:block; } .tpl-ceo .tpl-position { color:var(--d-text-muted, rgba(232,236,244,0.45)); font-size:0.9rem; }',
      parameters: [
        { key: 'zitat', label: 'Botschaft / Zitat', type: 'textarea', defaultValue: '', required: true },
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'position', label: 'Position', type: 'text', defaultValue: 'Geschäftsführung', required: false },
      ]
    },

    // ── SICHERHEIT & PRODUKTION ────────────────────────
    {
      id: 'tpl-safety',
      name: 'Sicherheitshinweis',
      description: 'Auffälliger Sicherheitshinweis mit Warnsymbol',
      category: 'sicherheit',
      icon: '&#9888;',
      htmlTemplate: '<div class="tpl tpl-safety"><div class="tpl-warning-strip"></div><div class="tpl-safety-content"><div class="tpl-icon">&#9888;</div><h1>{{titel}}</h1><p class="tpl-body">{{hinweis}}</p></div><div class="tpl-warning-strip"></div></div>',
      cssTemplate: '.tpl-safety { height:100%; display:flex; flex-direction:column; font-family:"DM Sans",sans-serif; } .tpl-safety .tpl-warning-strip { height:8px; background:repeating-linear-gradient(45deg, #F59E0B, #F59E0B 20px, var(--d-bg, #1A1F2E) 20px, var(--d-bg, #1A1F2E) 40px); flex-shrink:0; } .tpl-safety .tpl-safety-content { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem 3rem; background:linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%); } .tpl-safety .tpl-icon { font-size:4rem; margin-bottom:1rem; filter:drop-shadow(0 0 15px rgba(245,158,11,0.4)); } .tpl-safety h1 { font-family:"Outfit",sans-serif; font-size:2.2rem; font-weight:800; color:#F59E0B; margin:0 0 0.8rem; } .tpl-safety .tpl-body { font-size:1.2rem; color:var(--d-text-body, rgba(232,236,244,0.75)); line-height:1.6; max-width:85%; }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Sicherheitshinweis', required: true },
        { key: 'hinweis', label: 'Hinweistext', type: 'textarea', defaultValue: '', required: true },
      ]
    },
    {
      id: 'tpl-production',
      name: 'Produktions-Update',
      description: 'Status-Anzeige für Produktionslinien',
      category: 'produktion',
      icon: '&#9881;',
      htmlTemplate: '<div class="tpl tpl-production"><h2 class="tpl-section-title">PRODUKTIONS-UPDATE</h2><div class="tpl-status-card"><div class="tpl-status-indicator tpl-status-{{status}}"></div><div class="tpl-status-info"><h1>{{linie}}</h1><p class="tpl-status-label">Status: <strong>{{statusText}}</strong></p><p class="tpl-reason">{{grund}}</p></div></div><div class="tpl-footer"><span class="tpl-date">{{zeitpunkt}}</span></div></div>',
      cssTemplate: '.tpl-production { height:100%; display:flex; flex-direction:column; padding:2rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-production .tpl-section-title { font-family:"Outfit",sans-serif; font-size:0.85rem; font-weight:700; color:var(--d-text-faint, rgba(232,236,244,0.4)); letter-spacing:0.1em; margin:0 0 1.5rem; } .tpl-production .tpl-status-card { flex:1; display:flex; align-items:center; gap:2rem; background:var(--d-surface, rgba(255,255,255,0.03)); border:1px solid var(--d-border, rgba(255,255,255,0.06)); border-radius:14px; padding:2rem 2.5rem; } .tpl-production .tpl-status-indicator { width:20px; height:20px; border-radius:50%; flex-shrink:0; box-shadow:0 0 20px currentColor; } .tpl-production .tpl-status-gruen { background:#10B981; color:#10B981; } .tpl-production .tpl-status-gelb { background:#F59E0B; color:#F59E0B; } .tpl-production .tpl-status-rot { background:#EF4444; color:#EF4444; } .tpl-production h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 0.3rem; } .tpl-production .tpl-status-label { font-size:1.1rem; color:var(--d-text-muted, rgba(232,236,244,0.6)); margin:0; } .tpl-production .tpl-reason { font-size:1rem; color:var(--d-text-faint, rgba(232,236,244,0.4)); margin:0.5rem 0 0; } .tpl-production .tpl-footer { margin-top:1rem; padding-top:0.8rem; border-top:1px solid var(--d-border-subtle, rgba(255,255,255,0.06)); } .tpl-production .tpl-date { font-size:0.8rem; color:var(--d-text-faint, rgba(232,236,244,0.3)); }',
      parameters: [
        { key: 'linie', label: 'Linienname', type: 'text', defaultValue: 'Linie 3', required: true },
        { key: 'status', label: 'Status (gruen/gelb/rot)', type: 'select', options: ['gruen','gelb','rot'], defaultValue: 'gruen', required: true },
        { key: 'statusText', label: 'Status-Text', type: 'text', defaultValue: 'Läuft', required: true },
        { key: 'grund', label: 'Grund/Details', type: 'text', defaultValue: '', required: false },
        { key: 'zeitpunkt', label: 'Zeitpunkt', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-kpi',
      name: 'KPI Dashboard',
      description: 'Kennzahlen-Anzeige mit großen Zahlen',
      category: 'produktion',
      icon: '&#128200;',
      htmlTemplate: '<div class="tpl tpl-kpi"><h2 class="tpl-section-title">{{titel}}</h2><div class="tpl-kpi-grid"><div class="tpl-kpi-item"><span class="tpl-kpi-value">{{wert1}}</span><span class="tpl-kpi-label">{{label1}}</span></div><div class="tpl-kpi-item"><span class="tpl-kpi-value tpl-kpi-accent">{{wert2}}</span><span class="tpl-kpi-label">{{label2}}</span></div><div class="tpl-kpi-item"><span class="tpl-kpi-value">{{wert3}}</span><span class="tpl-kpi-label">{{label3}}</span></div></div></div>',
      cssTemplate: '.tpl-kpi { height:100%; display:flex; flex-direction:column; padding:2rem 2.5rem; font-family:"DM Sans",sans-serif; } .tpl-kpi .tpl-section-title { font-family:"Outfit",sans-serif; font-size:0.85rem; font-weight:700; color:var(--d-text-faint, rgba(232,236,244,0.4)); letter-spacing:0.1em; text-transform:uppercase; margin:0 0 1.5rem; text-align:center; } .tpl-kpi-grid { flex:1; display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; align-items:center; } .tpl-kpi-item { text-align:center; padding:1.5rem 1rem; background:var(--d-surface, rgba(255,255,255,0.03)); border:1px solid var(--d-border, rgba(255,255,255,0.06)); border-radius:12px; } .tpl-kpi-value { display:block; font-family:"Outfit",sans-serif; font-size:3rem; font-weight:800; color:var(--d-text, #E8ECF4); line-height:1; margin-bottom:0.5rem; } .tpl-kpi-accent { color:var(--d-accent, #B5CC18); } .tpl-kpi-label { font-size:0.85rem; color:var(--d-text-faint, rgba(232,236,244,0.4)); text-transform:uppercase; letter-spacing:0.05em; }',
      parameters: [
        { key: 'titel', label: 'Titel', type: 'text', defaultValue: 'Produktionskennzahlen', required: true },
        { key: 'wert1', label: 'Wert 1', type: 'text', defaultValue: '98.5%', required: true },
        { key: 'label1', label: 'Bezeichnung 1', type: 'text', defaultValue: 'Qualitätsrate', required: true },
        { key: 'wert2', label: 'Wert 2', type: 'text', defaultValue: '1.247', required: true },
        { key: 'label2', label: 'Bezeichnung 2', type: 'text', defaultValue: 'Stück/Tag', required: true },
        { key: 'wert3', label: 'Wert 3', type: 'text', defaultValue: '0', required: true },
        { key: 'label3', label: 'Bezeichnung 3', type: 'text', defaultValue: 'Unfälle', required: true },
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
      cssTemplate: '.tpl-job { height:100%; display:flex; flex-direction:column; font-family:"DM Sans",sans-serif; } .tpl-job-header { padding:2rem 3rem 1.5rem; background:linear-gradient(135deg, rgba(181,204,24,0.1) 0%, transparent 60%); } .tpl-job .tpl-job-badge { display:inline-block; background:var(--d-accent, #B5CC18); color:#163A6C; font-size:0.7rem; font-weight:800; padding:4px 14px; border-radius:4px; letter-spacing:0.1em; margin-bottom:0.8rem; } .tpl-job h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 0.5rem; } .tpl-job-meta { font-size:1rem; color:var(--d-text-muted, rgba(232,236,244,0.5)); margin:0; } .tpl-job-body { flex:1; padding:1.5rem 3rem; } .tpl-job-points { font-size:1.1rem; color:var(--d-text-body, rgba(232,236,244,0.7)); line-height:2; white-space:pre-line; } .tpl-job-footer { padding:1.2rem 3rem; border-top:1px solid var(--d-border-subtle, rgba(255,255,255,0.06)); background:var(--d-accent-subtle, rgba(181,204,24,0.05)); } .tpl-job-cta { font-size:0.9rem; font-weight:600; color:var(--d-accent, #B5CC18); }',
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
      description: 'Begrüßung für neue Mitarbeiter oder Besucher',
      category: 'personal',
      icon: '&#128075;',
      htmlTemplate: '<div class="tpl tpl-welcome"><div class="tpl-welcome-icon">&#128075;</div><p class="tpl-welcome-label">HERZLICH WILLKOMMEN</p><h1>{{name}}</h1><div class="tpl-welcome-details"><p>{{abteilung}}</p><p class="tpl-welcome-date">{{startdatum}}</p></div></div>',
      cssTemplate: '.tpl-welcome { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem; font-family:"DM Sans",sans-serif; background:linear-gradient(180deg, rgba(181,204,24,0.06) 0%, transparent 50%); } .tpl-welcome-icon { font-size:4rem; margin-bottom:0.5rem; } .tpl-welcome-label { font-size:0.85rem; font-weight:700; color:var(--d-accent, #B5CC18); letter-spacing:0.15em; margin:0 0 0.5rem; } .tpl-welcome h1 { font-family:"Outfit",sans-serif; font-size:2.8rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 1rem; } .tpl-welcome-details p { font-size:1.2rem; color:var(--d-text-muted, rgba(232,236,244,0.6)); margin:0.2rem 0; } .tpl-welcome-date { font-size:1rem; color:var(--d-text-faint, rgba(232,236,244,0.35)); }',
      parameters: [
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'abteilung', label: 'Abteilung / Bereich', type: 'text', defaultValue: '', required: false },
        { key: 'startdatum', label: 'Startdatum / Anlass', type: 'text', defaultValue: '', required: false },
      ]
    },
    {
      id: 'tpl-jubilee',
      name: 'Jubiläums-Glückwunsch',
      description: 'Ehrung für Firmenjubiläen',
      category: 'personal',
      icon: '&#127881;',
      htmlTemplate: '<div class="tpl tpl-jubilee"><div class="tpl-confetti">&#127881;</div><p class="tpl-jubilee-label">HERZLICHEN GLÜCKWUNSCH</p><h1>{{name}}</h1><div class="tpl-jubilee-years"><span class="tpl-years-number">{{jahre}}</span><span class="tpl-years-label">Jahre bei Blickle</span></div><p class="tpl-jubilee-text">{{text}}</p></div>',
      cssTemplate: '.tpl-jubilee { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem; font-family:"DM Sans",sans-serif; background:linear-gradient(135deg, rgba(181,204,24,0.08) 0%, rgba(245,158,11,0.06) 100%); } .tpl-confetti { font-size:3rem; margin-bottom:0.5rem; } .tpl-jubilee-label { font-size:0.8rem; font-weight:700; color:#F59E0B; letter-spacing:0.12em; margin:0 0 0.3rem; } .tpl-jubilee h1 { font-family:"Outfit",sans-serif; font-size:2.5rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 1rem; } .tpl-jubilee-years { background:var(--d-accent-subtle, rgba(181,204,24,0.15)); border:2px solid var(--d-border-accent, rgba(181,204,24,0.3)); border-radius:16px; padding:1rem 2.5rem; display:inline-flex; flex-direction:column; align-items:center; margin-bottom:1rem; } .tpl-years-number { font-family:"Outfit",sans-serif; font-size:3.5rem; font-weight:800; color:var(--d-accent, #B5CC18); line-height:1; } .tpl-years-label { font-size:0.85rem; color:var(--d-text-muted, rgba(232,236,244,0.5)); margin-top:0.2rem; } .tpl-jubilee-text { font-size:1.1rem; color:var(--d-text-muted, rgba(232,236,244,0.6)); margin-top:0.5rem; }',
      parameters: [
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'jahre', label: 'Anzahl Jahre', type: 'text', defaultValue: '25', required: true },
        { key: 'text', label: 'Glückwunschtext', type: 'textarea', defaultValue: 'Vielen Dank für Ihre Treue und Ihr Engagement!', required: false },
      ]
    },

    // ── EVENTS & SOZIALES ──────────────────────────────
    {
      id: 'tpl-event',
      name: 'Veranstaltung',
      description: 'Save-the-Date für Veranstaltungen',
      category: 'events',
      icon: '&#127880;',
      htmlTemplate: '<div class="tpl tpl-event"><span class="tpl-event-badge">SAVE THE DATE</span><h1>{{titel}}</h1><div class="tpl-event-details"><div class="tpl-event-detail"><span class="tpl-event-icon">&#128197;</span><span>{{datum}}</span></div><div class="tpl-event-detail"><span class="tpl-event-icon">&#128205;</span><span>{{ort}}</span></div></div><p class="tpl-event-desc">{{beschreibung}}</p></div>',
      cssTemplate: '.tpl-event { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2.5rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-event-badge { display:inline-block; background:var(--d-accent, #B5CC18); color:#163A6C; font-size:0.75rem; font-weight:800; padding:5px 18px; border-radius:4px; letter-spacing:0.12em; margin-bottom:1rem; } .tpl-event h1 { font-family:"Outfit",sans-serif; font-size:2.5rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 1.2rem; } .tpl-event-details { display:flex; gap:2rem; margin-bottom:1.2rem; } .tpl-event-detail { display:flex; align-items:center; gap:0.5rem; font-size:1.15rem; color:var(--d-text-body, rgba(232,236,244,0.7)); } .tpl-event-icon { font-size:1.3rem; } .tpl-event-desc { font-size:1.05rem; color:var(--d-text-muted, rgba(232,236,244,0.5)); line-height:1.5; max-width:80%; }',
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
      cssTemplate: '.tpl-countdown { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem; font-family:"DM Sans",sans-serif; } .tpl-countdown-label { font-size:0.85rem; font-weight:700; color:var(--d-text-faint, rgba(232,236,244,0.4)); letter-spacing:0.1em; margin:0 0 1rem; } .tpl-countdown-number { font-family:"Outfit",sans-serif; font-size:8rem; font-weight:900; color:var(--d-accent, #B5CC18); line-height:1; text-shadow:0 0 40px rgba(181,204,24,0.3); } .tpl-countdown-unit { font-size:1.2rem; font-weight:700; color:var(--d-text-faint, rgba(232,236,244,0.4)); letter-spacing:0.2em; margin:0.2rem 0 1.5rem; } .tpl-countdown h2 { font-family:"Outfit",sans-serif; font-size:1.8rem; font-weight:700; color:var(--d-text, #E8ECF4); margin:0 0 0.3rem; } .tpl-countdown-date { font-size:1rem; color:var(--d-text-faint, rgba(232,236,244,0.4)); margin:0; }',
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
      cssTemplate: '.tpl-training { height:100%; display:flex; flex-direction:column; padding:2rem 3rem; font-family:"DM Sans",sans-serif; } .tpl-training-header { margin-bottom:1.5rem; } .tpl-training-badge { display:inline-block; font-size:0.65rem; font-weight:800; padding:3px 12px; border-radius:4px; letter-spacing:0.1em; background:rgba(239,68,68,0.15); color:#EF4444; margin-bottom:0.8rem; } .tpl-training h1 { font-family:"Outfit",sans-serif; font-size:2rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0; } .tpl-training-details { flex:1; display:flex; flex-direction:column; gap:0.8rem; } .tpl-training-row { display:flex; align-items:center; gap:1rem; padding:0.8rem 1.2rem; background:var(--d-surface, rgba(255,255,255,0.03)); border:1px solid var(--d-border, rgba(255,255,255,0.06)); border-radius:10px; } .tpl-training-icon { font-size:1.3rem; width:2rem; text-align:center; flex-shrink:0; } .tpl-training-label { font-size:0.8rem; color:var(--d-text-faint, rgba(232,236,244,0.4)); width:6rem; flex-shrink:0; } .tpl-training-value { font-size:1.05rem; color:var(--d-text, #E8ECF4); font-weight:500; } .tpl-training-note { font-size:0.95rem; color:var(--d-text-muted, rgba(232,236,244,0.5)); margin-top:1rem; padding-top:0.8rem; border-top:1px solid var(--d-border-subtle, rgba(255,255,255,0.06)); line-height:1.5; }',
      parameters: [
        { key: 'titel', label: 'Schulungsname', type: 'text', defaultValue: '', required: true },
        { key: 'pflicht', label: 'Pflicht/Freiwillig', type: 'text', defaultValue: 'PFLICHTSCHULUNG', required: false },
        { key: 'datum', label: 'Datum & Uhrzeit', type: 'text', defaultValue: '', required: true },
        { key: 'ort', label: 'Ort / Raum', type: 'text', defaultValue: '', required: true },
        { key: 'teilnehmer', label: 'Teilnehmerkreis', type: 'text', defaultValue: 'Alle Produktionsmitarbeiter', required: false },
        { key: 'hinweis', label: 'Zusätzlicher Hinweis', type: 'textarea', defaultValue: '', required: false },
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

    // ── NEUE TEMPLATES (Einblickle-Magazin) ──────────
    {
      id: 'tpl-spotlight',
      name: 'Mitarbeiter-Spotlight',
      description: 'Persönliches Portrait eines Mitarbeiters mit Hobby/Zitat',
      category: 'personal',
      icon: '&#11088;',
      htmlTemplate: '<div class="tpl tpl-spotlight"><div class="tpl-spotlight-photo"><img src="{{bild}}" alt="{{name}}" /></div><div class="tpl-spotlight-info"><span class="tpl-spotlight-badge">MITARBEITER-SPOTLIGHT</span><h1>{{name}}</h1><p class="tpl-spotlight-dept">{{abteilung}}</p><div class="tpl-spotlight-quote"><span class="tpl-spotlight-qmark">&#8220;</span><p>{{zitat}}</p></div><p class="tpl-spotlight-hobby"><strong>Hobby:</strong> {{hobby}}</p></div></div>',
      cssTemplate: '.tpl-spotlight { height:100%; display:flex; font-family:"DM Sans",sans-serif; overflow:hidden; } .tpl-spotlight-photo { width:40%; min-width:200px; flex-shrink:0; overflow:hidden; position:relative; } .tpl-spotlight-photo img { width:100%; height:100%; object-fit:cover; } .tpl-spotlight-photo::after { content:""; position:absolute; top:0; right:0; bottom:0; width:60px; background:linear-gradient(to right, transparent, var(--d-bg, rgba(8,12,24,0.95))); } .tpl-spotlight-info { flex:1; display:flex; flex-direction:column; justify-content:center; padding:2rem 2.5rem; } .tpl-spotlight-badge { display:inline-block; font-size:0.65rem; font-weight:800; color:var(--d-accent, #B5CC18); letter-spacing:0.12em; margin-bottom:0.5rem; } .tpl-spotlight h1 { font-family:"Outfit",sans-serif; font-size:2.2rem; font-weight:800; color:var(--d-text, #E8ECF4); margin:0 0 0.2rem; } .tpl-spotlight-dept { font-size:1rem; color:var(--d-text-muted, rgba(232,236,244,0.45)); margin:0 0 1.2rem; } .tpl-spotlight-quote { border-left:3px solid var(--d-accent, #B5CC18); padding-left:1rem; margin-bottom:1rem; position:relative; } .tpl-spotlight-qmark { font-family:Georgia,serif; font-size:3rem; color:var(--d-accent-faint, rgba(181,204,24,0.4)); line-height:0.5; position:absolute; top:0.3rem; left:-0.3rem; } .tpl-spotlight-quote p { font-size:1.1rem; font-style:italic; color:var(--d-text-body, rgba(232,236,244,0.75)); line-height:1.5; margin:0; padding-left:1rem; } .tpl-spotlight-hobby { font-size:0.95rem; color:var(--d-text-muted, rgba(232,236,244,0.55)); margin:0; } .tpl-spotlight-hobby strong { color:var(--d-text-body, rgba(232,236,244,0.7)); }',
      parameters: [
        { key: 'name', label: 'Name', type: 'text', defaultValue: '', required: true },
        { key: 'abteilung', label: 'Abteilung', type: 'text', defaultValue: '', required: false },
        { key: 'hobby', label: 'Hobby / Besonderheit', type: 'text', defaultValue: '', required: true },
        { key: 'zitat', label: 'Zitat / persönlicher Satz', type: 'textarea', defaultValue: '', required: true },
        { key: 'bild', label: 'Bild-URL', type: 'text', defaultValue: '/content/einblickle/placeholder.jpg', required: false },
      ]
    },
    {
      id: 'tpl-news-compact',
      name: 'Kurznachrichten',
      description: 'Mehrere kurze News kompakt auf einer Karte',
      category: 'kommunikation',
      icon: '&#128220;',
      htmlTemplate: '<div class="tpl tpl-newscompact"><h2 class="tpl-nc-title">{{titel}}</h2><div class="tpl-nc-list"><div class="tpl-nc-item"><div class="tpl-nc-dot"></div><div class="tpl-nc-content"><h3>{{news1_titel}}</h3><p>{{news1_text}}</p></div></div><div class="tpl-nc-item"><div class="tpl-nc-dot"></div><div class="tpl-nc-content"><h3>{{news2_titel}}</h3><p>{{news2_text}}</p></div></div><div class="tpl-nc-item"><div class="tpl-nc-dot"></div><div class="tpl-nc-content"><h3>{{news3_titel}}</h3><p>{{news3_text}}</p></div></div></div></div>',
      cssTemplate: '.tpl-newscompact { height:100%; display:flex; flex-direction:column; padding:2rem 2.5rem; font-family:"DM Sans",sans-serif; } .tpl-nc-title { font-family:"Outfit",sans-serif; font-size:0.85rem; font-weight:700; color:var(--d-text-faint, rgba(232,236,244,0.4)); letter-spacing:0.1em; text-transform:uppercase; margin:0 0 1.5rem; } .tpl-nc-list { flex:1; display:flex; flex-direction:column; gap:0.8rem; } .tpl-nc-item { display:flex; gap:1rem; padding:1rem 1.2rem; background:var(--d-surface, rgba(255,255,255,0.03)); border:1px solid var(--d-border, rgba(255,255,255,0.06)); border-radius:10px; flex:1; align-items:flex-start; transition:border-color 0.2s ease; } .tpl-nc-item:hover { border-color:var(--d-border-accent, rgba(181,204,24,0.2)); } .tpl-nc-dot { width:10px; height:10px; border-radius:50%; background:var(--d-accent, #B5CC18); flex-shrink:0; margin-top:0.35rem; box-shadow:0 0 8px rgba(181,204,24,0.3); } .tpl-nc-content h3 { font-family:"Outfit",sans-serif; font-size:1.05rem; font-weight:700; color:var(--d-text, #E8ECF4); margin:0 0 0.3rem; } .tpl-nc-content p { font-size:0.9rem; color:var(--d-text-muted, rgba(232,236,244,0.55)); line-height:1.45; margin:0; }',
      parameters: [
        { key: 'titel', label: 'Überschrift', type: 'text', defaultValue: 'KURZNACHRICHTEN', required: true },
        { key: 'news1_titel', label: 'News 1 Titel', type: 'text', defaultValue: '', required: true },
        { key: 'news1_text', label: 'News 1 Text', type: 'text', defaultValue: '', required: true },
        { key: 'news2_titel', label: 'News 2 Titel', type: 'text', defaultValue: '', required: true },
        { key: 'news2_text', label: 'News 2 Text', type: 'text', defaultValue: '', required: true },
        { key: 'news3_titel', label: 'News 3 Titel', type: 'text', defaultValue: '', required: true },
        { key: 'news3_text', label: 'News 3 Text', type: 'text', defaultValue: '', required: true },
      ]
    },
    {
      id: 'tpl-project',
      name: 'Projekt-Showcase',
      description: 'Projekt oder Success-Story mit Bild und Beschreibung',
      category: 'kommunikation',
      icon: '&#128640;',
      htmlTemplate: '<div class="tpl tpl-project"><div class="tpl-project-image"><img src="{{bild}}" alt="{{projektname}}" /></div><div class="tpl-project-overlay"><span class="tpl-project-badge">{{kategorie}}</span><h1>{{projektname}}</h1><p class="tpl-project-desc">{{beschreibung}}</p></div></div>',
      cssTemplate: '.tpl-project { height:100%; position:relative; font-family:"DM Sans",sans-serif; overflow:hidden; } .tpl-project-image { position:absolute; inset:0; } .tpl-project-image img { width:100%; height:100%; object-fit:cover; } .tpl-project-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(8,12,24,0.92) 0%, rgba(8,12,24,0.5) 50%, transparent 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:2.5rem 3rem; } .tpl-project-badge { display:inline-block; align-self:flex-start; font-size:0.65rem; font-weight:800; color:#B5CC18; letter-spacing:0.12em; text-transform:uppercase; background:rgba(181,204,24,0.15); padding:4px 14px; border-radius:4px; margin-bottom:0.8rem; } .tpl-project h1 { font-family:"Outfit",sans-serif; font-size:2.4rem; font-weight:800; color:#E8ECF4; margin:0 0 0.6rem; line-height:1.2; } .tpl-project-desc { font-size:1.1rem; color:rgba(232,236,244,0.7); line-height:1.5; margin:0; max-width:85%; }',
      parameters: [
        { key: 'projektname', label: 'Projektname', type: 'text', defaultValue: '', required: true },
        { key: 'beschreibung', label: 'Beschreibung', type: 'textarea', defaultValue: '', required: true },
        { key: 'kategorie', label: 'Kategorie-Badge', type: 'text', defaultValue: 'PROJEKT', required: false },
        { key: 'bild', label: 'Bild-URL', type: 'text', defaultValue: '/content/einblickle/projekte.jpg', required: false },
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
        { id: 'home-tr', type: 'canteen-menu', title: 'Heute im s\'Raedle' },
        { id: 'home-bl', type: 'weather', title: 'Wetter' },
        { id: 'home-br', type: 'news-feed', title: 'News' },
      ]
    },
    {
      id: 'kantine',
      label: 'S\'RAEDLE',
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
      label: 'PLÄNE',
      icon: '&#128197;',
      layout: 'full',
      zones: [
        { id: 'plaene-full', type: 'schedule-weekly', title: 'Schichtplan nächste Woche' },
      ]
    },
  ]
}

export function getSeedScheduleData() {
  return {
    today: [
      { zeit: '06:00 - 14:00', name: 'Frühschicht', mitarbeiter: ['M. Schmidt', 'K. Weber', 'S. Fischer', 'H. Müller'] },
      { zeit: '14:00 - 22:00', name: 'Spätschicht', mitarbeiter: ['A. Wagner', 'P. Becker', 'L. Hoffmann', 'R. Schulz'] },
      { zeit: '22:00 - 06:00', name: 'Nachtschicht', mitarbeiter: ['J. Koch', 'D. Richter'] },
    ],
    weekly: {
      schichten: ['Frühschicht', 'Spätschicht', 'Nachtschicht'],
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
    { tag: 'Montag', gericht1: 'Schnitzel mit Kartoffelsalat', gericht2: 'Gemüse-Curry mit Reis', beilage: 'Tagessuppe: Tomatensuppe', preis1: '5,80', preis2: '4,50', beschreibung1: 'Mit Zitrone & Preiselbeeren', beschreibung2: 'Mit Basmatireis & Naan-Brot', bild1: 'https://picsum.photos/seed/schnitzel/96/96', bild2: 'https://picsum.photos/seed/curry/96/96' },
    { tag: 'Dienstag', gericht1: 'Spaghetti Bolognese', gericht2: 'Spinat-Gnocchi', beilage: 'Tagessuppe: Gulaschsuppe', preis1: '4,90', preis2: '4,20', beschreibung1: 'Mit frischem Parmesan', beschreibung2: 'Mit Salbei-Butter & Pinienkernen', bild1: 'https://picsum.photos/seed/bolognese/96/96', bild2: 'https://picsum.photos/seed/gnocchi/96/96' },
    { tag: 'Mittwoch', gericht1: 'Hähnchenbrust mit Gemüse', gericht2: 'Käsespätzle', beilage: 'Tagessuppe: Kartoffelsuppe', preis1: '5,50', preis2: '4,20', beschreibung1: 'Mit Rosmarinkartoffeln & Grillgemüse', beschreibung2: 'Mit Röstzwiebeln & kleinem Beilagensalat', bild1: 'https://picsum.photos/seed/chicken/96/96', bild2: 'https://picsum.photos/seed/kaesespaetzle/96/96' },
    { tag: 'Donnerstag', gericht1: 'Rindergulasch mit Knödel', gericht2: 'Gemüse-Lasagne', beilage: 'Tagessuppe: Linsensuppe', preis1: '6,20', preis2: '4,80', beschreibung1: 'Klassisch mit Semmelknödel', beschreibung2: 'Mit Bechamel & frischem Basilikum', bild1: 'https://picsum.photos/seed/gulasch/96/96', bild2: 'https://picsum.photos/seed/lasagne/96/96' },
    { tag: 'Freitag', gericht1: 'Gebratener Fisch mit Pommes', gericht2: 'Pizza Margherita', beilage: 'Tagessuppe: Brokkolicremesuppe', preis1: '5,90', preis2: '4,50', beschreibung1: 'Knuspriger Seelachs mit Remoulade', beschreibung2: 'Mit Mozzarella & frischem Basilikum', bild1: 'https://picsum.photos/seed/fish/96/96', bild2: 'https://picsum.photos/seed/pizza/96/96' },
  ]
  return { tage, gerichte }
}

export function getSeedNewsData() {
  return [
    { id: 'news-1', title: 'Unterweisung Arbeitssicherheit 2024', text: 'Bitte denken Sie an den fristgerechten Abschluss der jährlichen Sicherheitsunterweisung im E-Learning Portal bis zum 30.06.', datum: '15.03.2026', kategorie: 'Sicherheit', imageUrl: '/content/karriere/blickle-fertigung.jpg', imageAlt: 'Arbeitssicherheit Unterweisung' },
    { id: 'news-2', title: 'Wartungsarbeiten in Halle 4', text: 'Am kommenden Wochenende werden planmäßige Instandsetzungsarbeiten an der Hauptmontagelinie durchgeführt. Zugang nur für befugtes Personal.', datum: '12.03.2026', kategorie: 'Produktion', imageUrl: '/content/karriere/blickle-produktion.jpg', imageAlt: 'Wartungsarbeiten Halle 4' },
    { id: 'news-3', title: '#TeamBlickle Kollektion im S\'LAEDLE', text: 'Die neue Kleidungskollektion ist da! Hoodies, T-Shirts und Caps im Blickle-Design.', datum: '10.03.2026', kategorie: 'Mitarbeiter', imageUrl: 'https://picsum.photos/seed/teamwear/400/240', imageAlt: 'TeamBlickle Kollektion' },
    { id: 'news-4', title: 'Firmenlauf Balingen: 60+ Läufer!', text: 'Blickle war mit über 60 Läuferinnen und Läufern stark vertreten. Highlight: HBW-Sieg!', datum: '08.03.2026', kategorie: 'Events', imageUrl: 'https://picsum.photos/seed/running/400/240', imageAlt: 'Firmenlauf Balingen' },
    { id: 'news-5', title: 'DKMS: Kollege rettet Leben', text: 'Ein Blickle-Mitarbeiter hat durch eine Stammzellspende über die DKMS einem Menschen das Leben gerettet.', datum: '11.03.2026', kategorie: 'Mitarbeiter', imageUrl: 'https://picsum.photos/seed/health/400/240', imageAlt: 'DKMS Stammzellspende' },
    { id: 'news-6', title: '5 Jahre ErgoMove', text: 'Unser ergonomischer Antrieb feiert 5-jähriges Jubiläum. Über 10.000 Einheiten weltweit verkauft.', datum: '09.03.2026', kategorie: 'Neuheiten', imageUrl: 'https://picsum.photos/seed/innovation/400/240', imageAlt: 'ErgoMove Jubiläum' },
  ]
}

export function getSeedTickerMessages() {
  return [
    'Willkommen bei Blickle! Alle Neuigkeiten auf einen Blick.',
    '#TeamBlickle Kollektion - Hoodies, T-Shirts und Caps jetzt im S\'LAEDLE erhältlich!',
    'Matrixorganisation in der Produktion startet ab Januar 2026.',
    'Firmenlauf Balingen: Über 60 Blickle-Läufer am Start - HBW-Sieg!',
    'Projekt Frida: Hochbeete fürs s\'Raedle - nachhaltig und selbst angebaut.',
    '5 Jahre ErgoMove - über 10.000 Einheiten weltweit!',
    'DKMS: Ein Blickle-Kollege hat einem Menschen das Leben gerettet. Danke!',
  ]
}

export function getSeedKarriereData() {
  return {
    jobs: [
      { id: 'job-1', title: 'Sachbearbeiter Export / Außenhandel (m/w/d)', abteilung: 'Außendienst/Export/Verkauf', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-2', title: 'Inhouse Consultant SAP SD (m/w/d)', abteilung: 'Controlling/Rechnungswesen', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-3', title: 'Assistenz im Key Account Management (m/w/d)', abteilung: 'Außendienst/Export/Verkauf', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-4', title: 'Mitarbeiter Werkzeugbau (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-5', title: 'Controller (m/w/d)', abteilung: 'Controlling/Rechnungswesen', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-6', title: 'Assistenz der Konstruktionsleitung (m/w/d)', abteilung: 'Konstruktion/Entwicklung', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-7', title: 'Fertigungsbereichsleiter Kunststofffertigung (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-8', title: 'Monteur elektrische Antriebssysteme (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-9', title: 'IT-Systembetreuer (m/w/d)', abteilung: 'IT', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-10', title: 'SAP Application Developer ABAP (m/w/d)', abteilung: 'IT', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-11', title: 'Verfahrensmechaniker Kunststofftechnik (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-12', title: 'Mitglied der Exportleitung Vertrieb International (m/w/d)', abteilung: 'Außendienst/Export/Verkauf', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-13', title: 'Mitarbeiter Fertigung / Produktion / Montage (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-14', title: 'Schweißer MAG (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-15', title: 'Mitarbeiter Instandhaltung (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-16', title: 'Personalreferent / HR-Spezialist (m/w/d)', abteilung: 'Personal', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-17', title: 'Sachbearbeiter Einkauf (m/w/d)', abteilung: 'Einkauf', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-18', title: 'Service-Techniker Elektrische Antriebssysteme (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-19', title: 'Fertigungsplaner / Industrial Engineer (m/w/d)', abteilung: 'Operational Excellence', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-20', title: 'Entwicklungsingenieur mechanische Baugruppen (m/w/d)', abteilung: 'Konstruktion/Entwicklung', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-21', title: 'Qualitätstechniker Fertigungs-QS (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-22', title: 'Produktionscontroller (m/w/d)', abteilung: 'Controlling/Rechnungswesen', standort: 'Rosenfeld', typ: 'Vollzeit' },
      { id: 'job-23', title: 'Mitarbeiter im Winterdienst (m/w/d)', abteilung: 'Fertigung/Logistik', standort: 'Rosenfeld', typ: 'Minijob' },
      { id: 'job-24', title: 'Initiativbewerbung Fertigung (m/w/d)', abteilung: 'alle Funktionsbereiche', standort: 'Rosenfeld', typ: 'Vollzeit' },
    ],
    referral: {
      title: 'Mitarbeiter werben Mitarbeiter',
      bonus: 500,
      beschreibung: 'Empfehlen Sie qualifizierte Kandidaten und erhalten Sie eine Prämie von 500 EUR bei erfolgreicher Einstellung!'
    }
  }
}

export function getSeedProduktionNews() {
  return [
    {
      id: 'pn-1',
      title: 'Vision Produktion 2030',
      text: 'Strategische Neuausrichtung der Fertigung: Digitalisierung, Automatisierung und nachhaltige Prozesse stehen im Fokus unserer Produktionsstrategie.',
      datum: '26.11.2025',
      kategorie: 'Strategie',
      wichtig: true
    },
    {
      id: 'pn-2',
      title: 'Neues CNC-Bearbeitungszentrum',
      text: 'Investition in ein 5-Achs-CNC-Bearbeitungszentrum für die Werkzeugfertigung. Inbetriebnahme geplant für Q1 2026.',
      datum: '15.01.2026',
      kategorie: 'Investition'
    },
    {
      id: 'pn-3',
      title: 'Lean-Arbeitskreis gestartet',
      text: 'Start des bereichsübergreifenden Lean-Arbeitskreises zur kontinuierlichen Verbesserung in der Kunststofffertigung.',
      datum: '03.02.2026',
      kategorie: 'Optimierung'
    },
    {
      id: 'pn-4',
      title: 'Automatisierung Montagelinie 3',
      text: 'Erfolgreiche Umrüstung der Montagelinie 3 auf teilautomatisierten Betrieb. Kapazitätssteigerung um 20%.',
      datum: '20.02.2026',
      kategorie: 'Automatisierung'
    },
    {
      id: 'pn-5',
      title: 'Energieeffizienz-Projekt',
      text: 'Neue LED-Hallenbeleuchtung und optimierte Druckluftversorgung reduzieren den Energieverbrauch um 15%.',
      datum: '10.03.2026',
      kategorie: 'Nachhaltigkeit'
    },
  ]
}

export function getSeedFullscreenMedia() {
  return [
    { id: 'fs-1', title: 'Vision Produktion 2030', mediaUrl: '/media/Meistersitzung.mp4', mediaType: 'video', duration: 60 },
    { id: 'fs-2', title: 'Plakat Produktion 2030', mediaUrl: '/media/Plakat_Produktion2030_V1.jpg', mediaType: 'image', duration: 15 },
    { id: 'fs-3', title: 'Plakat Produktion 2030 V2', mediaUrl: '/media/Plakat_Produktion2030_V2.jpg', mediaType: 'image', duration: 15 },
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
