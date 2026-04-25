# Session-Handover — 2026-04-26

## Kontext

In dieser Session wurde das Display-System fachlich neu sortiert und technisch weiter "verheiratet": Inhalte, Display-Seiten, Playlists, Zeitplanung, Simulation und die echte Display-Rotation sollen nicht mehr wie getrennte Werkzeuge wirken, sondern als zusammenhaengende Ausspielungslogik.

Wichtig fuer die spaetere WordPress-Plugin-Umsetzung: Die heutige Entscheidung ist grundlegend. Eine Playlist ist **nicht** das vollstaendige Programm eines Displays. Eine Playlist ist eine kuratierte Inhaltsfolge. Die vollstaendige Sendeschleife heisst ab jetzt **Display-Programm**.

## Produktlogik

### Begriffe

| Begriff | Bedeutung | Beispiel |
|---|---|---|
| Inhalt | Einzelner Beitrag, PDF, Video, Meldung oder Template-Inhalt | Sicherheitsinfo, Speiseplan-PDF, GL-Mitteilung |
| Display-Seite | Layout/Komposition einer sichtbaren Seite | Startseite mit 4 Slots, Shopfloor-Seite, Speiseplan-Seite |
| Playlist | Kuratierte Reihenfolge von Inhalten | Sicherheitsinfos: PSA, Fluchtwege, Erste Hilfe |
| Display-Programm | Vollstaendige Sendeschleife eines Displays | Home -> Speiseplan -> aktive Playlist -> Infos -> Shopfloor |
| Zeitplanung | Wann und wo Inhalte, Playlists oder Programme aktiv sind | FB1, Mo-Fr, 11:30-13:00 |
| Ausspielung pruefen | Kontrollraum/Simulation: Was laeuft auf Standort X zu Zeitpunkt Y und warum? | FB2 morgen 11:30 |

Merksatz:

```text
Display-Seite = Was kann angezeigt werden?
Playlist = Welche Inhalte rotieren innerhalb eines Blocks?
Display-Programm = In welcher Reihenfolge laufen Seiten/Playlists auf einem Display?
Zeitplanung = Wann und wo gilt das?
Simulation = Was kommt am Ende wirklich raus?
```

## Admin-Informationsarchitektur

Die Navigation wurde gedanklich und teilweise technisch auf diese Struktur ausgerichtet:

```text
Dashboard

Inhalte
- Veröffentlichen
- Inhaltsbibliothek
- Freigaben
- Vorlagen

Display
- Ausspielung prüfen
- Programme
- Display-Seiten
- Playlists
- Zeitplanung
- Layouts

Produktion
- Shopfloor-Board

System
- Standorte
- Notfall
- Benutzer
- Audit-Log
```

Begruendung:

- **Ausspielung pruefen** ist der Kontrollraum, nicht nur eine Vorschau.
- **Programme** ist der fehlende zentrale Ablaufplan.
- **Display-Seiten** bleibt Komposition einzelner Seiten.
- **Playlists** bleibt Inhaltsrotation.
- **Zeitplanung** bleibt Kalender/Regelsicht.
- **Shopfloor-Board** bleibt bewusst stark sichtbar unter Produktion, weil es spaeter eigenstaendiger werden kann.

## Was technisch umgesetzt wurde

### 1. Display Composition Foundation

Neue/erweiterte Bausteine fuer konfigurierbare Display-Seiten:

- `dsb/src/shared/displayEngine/sourceRegistry.js`
- `dsb/src/shared/displayEngine/displayPageDefaults.js`
- `dsb/src/shared/displayEngine/displayPageBuilder.js`
- `dsb/src/shared/stores/displayPageStore.js`
- `dsb/src/admin/pages/DisplayPagesPage.vue`

Ziel:

- Die Startseite ist keine Sonderlogik mehr, sondern eine konfigurierbare `DisplayPage`.
- Slots koennen Quellen bekommen, z.B. Widgets, Content, Template oder Media.
- Standort-Overrides sind vorbereitet.

Wichtige Runtime-Regel:

- Content-Slots duerfen nicht ungeprueft rendern.
- `displayPageBuilder` bekommt `visibleContentIds` und laesst Content-Zonen weg, wenn der Inhalt nach Freigabe/Gueltigkeit/Zeitplan/Standort nicht sichtbar ist.

### 2. Zeitplanung wurde zur Ausspielungspruefung erweitert

Dateien:

- `dsb/src/admin/pages/SchedulePage.vue`
- `dsb/src/shared/stores/scheduleStore.js`
- `dsb/src/shared/scheduling/scheduleRules.js`

Neue Logik:

- Filter nach Standort, Zeitraum, Typ, Status und Zeitfenster.
- Agenda pro Tag.
- Kalendertage sind anklickbar und fokussieren die Agenda auf genau diesen Tag.
- Inhalte ohne expliziten Zeitplan werden als `Sichtbar ohne Zeitplan` angezeigt, wenn sie freigegeben, gueltig und standortpassend sind.
- Explizite Zeitplaene und implizit sichtbare Inhalte werden sauber unterschieden.
- Status `Heute laufend` nutzt dieselbe Aktivlogik wie die Display-Runtime.
- Zeitplanung kann jetzt neben `content` und `playlist` auch `program` als `targetType`.

Fachliche Regel:

```text
Freigabe + Standort + Gueltigkeit = Grundsichtbarkeit
Zeitplan = zusaetzliche Einschraenkung oder gezielte Ausspielung
```

### 3. Publish Wizard wurde mit Zeitplanung verbunden

Dateien:

- `dsb/src/admin/pages/PublishWizardPage.vue`
- `dsb/src/admin/components/publish/PublishTargetStep.vue`
- `dsb/src/admin/components/publish/PublishReviewStep.vue`

Neue Logik:

- Wenn beim Veröffentlichen ein vollstaendiger Zeitraum gesetzt ist, wird automatisch ein Content-Zeitplan erzeugt.
- Der Review-Schritt zeigt Gültigkeit und Zeitplanung klarer.
- Damit ist Veröffentlichen nicht mehr nur Content-Erstellung, sondern wird direkt mit Ausspielung verbunden.

Noch sinnvoll fuer spaeter:

- Der Wizard sollte im letzten Schritt eine Wirkungsbox bekommen:
  - "Nach Freigabe sichtbar auf: FB1/FB2"
  - "Quelle: Inhaltsgueltigkeit oder Zeitplan"
  - "Erscheint in: Infos / Ticker / Playlist / Programm"

### 4. Neues Modell: Display-Programme

Neue Dateien:

- `dsb/src/shared/displayEngine/displayProgramRules.js`
- `dsb/src/shared/displayEngine/displayProgramRules.test.js`
- `dsb/src/shared/stores/displayProgramStore.js`
- `dsb/src/admin/pages/DisplayProgramsPage.vue`

Erweiterte Dateien:

- `dsb/src/shared/repositories/appRepositories.js`
- `dsb/src/shared/utils/seedData.js`
- `dsb/src/shared/composables/useDisplayContent.js`
- `dsb/src/router.js`
- `dsb/src/admin/AdminSidebar.vue`
- `dsb/src/admin/AdminShell.vue`
- `dsb/src/shared/auth/policies.js`

Default-Programm:

```text
Standardprogramm
1. Startseite
2. Speiseplan
3. Snackplan
4. Aktive Playlist
5. Info-Seiten
6. Designer-Inhalte
7. Produktion
8. Shopfloor-Board
9. Social Wall
10. Medienrotation
11. Layout-Seiten
```

Display-Programm-Datenmodell im Prototyp:

```js
{
  id: 'program-standard',
  name: 'Standardprogramm',
  description: 'Die reguläre Sendeschleife für alle Displays.',
  locationIds: [],
  priority: 1,
  isActive: true,
  entries: [
    {
      id: 'program-entry-home',
      type: 'displayPage',
      targetId: 'home',
      duration: 15,
      transition: 'fade',
      enabled: true
    }
  ]
}
```

Entry-Typen:

| Typ | Bedeutung |
|---|---|
| `displayPage` | Konfigurierte Display-Seite, z.B. `home` |
| `systemPage` | Feste Systemseite, z.B. Speiseplan, Produktion, Shopfloor |
| `playlist` | Inhaltsplaylist. `targetId: active` bedeutet: die aktuell gewinnende Playlist |
| `autoGroup` | Automatisch erzeugte Seitengruppe, z.B. Infos, Medien, Layouts |

Runtime-Regel:

- `resolveActiveDisplayProgram()` waehlt das aktive Programm nach:
  1. aktivem Programm-Zeitplan
  2. Standort-Scope
  3. Prioritaet
  4. Fallback auf ungescheduled Standardprogramm

### 5. Display-Runtime nutzt Programme

Datei:

- `dsb/src/shared/composables/useDisplayContent.js`

Vorher:

- `useDisplayContent` baute die komplette Display-Rotation direkt als Array zusammen.
- Die Reihenfolge war damit technisch vorhanden, aber nicht administrierbar.

Jetzt:

- `useDisplayContent` baut interne Page-Pools:
  - `displayPages`
  - `systemPages`
  - `activePlaylistPages`
  - `autoGroups`
- `buildProgramPages(activeDisplayProgram, pagePools)` erzeugt daraus die finale Rotation.
- Preview-Seiten werden weiterhin vorangestellt.

Damit ist die Reihenfolge fachlich ein Admin-Modell und nicht nur versteckte Code-Logik.

### 6. Playlists wurden begrifflich eingeordnet

Dateien:

- `dsb/src/admin/pages/PlaylistEditorPage.vue`
- `dsb/src/shared/displayEngine/pageBuilder.js`
- `dsb/src/display/DisplayShell.vue`

Neue/angepasste Logik:

- Playlist-Editor zeigt jetzt Ausspielungskontext:
  - Anzahl Zeitplan-Regeln
  - Anzahl Programme mit Playlist-Baustein
  - Link zu Programmen
- Playlist-Items behalten Dauer und Uebergang.
- `buildPlaylistContentPage()` reicht `transition` in die Seite.
- `DisplayShell` unterscheidet `fade`, `slide` und `none` grob in der Runtime.

Fachliche Klarstellung:

- Playlist ist eine **Inhaltsplaylist**, kein Display-Programm.
- Ob und wo eine Playlist laeuft, entscheidet:
  - ein Programm-Baustein
  - optional ein Playlist-Zeitplan
  - Standort/Gueltigkeit der enthaltenen Inhalte

### 7. Ausspielung pruefen / Simulation

Datei:

- `dsb/src/admin/pages/DisplaySimulationPage.vue`

Anpassung:

- Die Seite wurde im Menü von `Simulation` zu `Ausspielung prüfen` umbenannt.
- In der Preview-Meta wird das aktive Display-Programm angezeigt.

Ziel fuer spaeter:

- Diese Seite sollte der zentrale Kontrollraum werden:
  - Standort
  - Datum/Uhrzeit
  - aktives Programm
  - aktive Playlist
  - sichtbare/ausgeblendete Inhalte
  - Begruendung pro Seite/Inhalt

### 8. Kantinen-PDFs und Content-Sichtbarkeit

Datei:

- `dsb/src/shared/composables/useDisplayContent.js`

Problem vorher:

- Speiseplan/Snackplan wurden direkt per `contentStore.getById()` gelesen.
- Dadurch konnten Zeitplan, Gültigkeit und Standortfilter teilweise umgangen werden.

Anpassung:

- PDF-Dateien werden nun aus `locationContent` genommen.
- Wenn der Content-Datensatz existiert, aber nicht sichtbar ist, wird nicht blind die Datei ausgespielt.
- Nur wenn der Content-Datensatz fehlt, greift der statische Fallback aus `/pdf/...`.

## Sub-Agent-Review: wichtigste Befunde

Es wurden drei Sub-Agents eingesetzt:

1. Runtime-/Datenmodell-Architektur
2. Admin-UX aus Redakteur-/Admin-Sicht
3. Integrationsrisiken und Randfaelle

Hauptbefunde:

- Es fehlte ein persistiertes Objekt fuer die tatsaechliche Display-Rotation: geloest durch **Display-Programme**.
- Playlist war fachlich zu gross gedacht: eingeordnet als Inhaltsplaylist.
- Zeitplanung muss explizite Regeln und Grundsichtbarkeit unterscheiden: in der Agenda umgesetzt.
- Simulation muss prominenter werden: umbenannt zu **Ausspielung prüfen**.
- Kantinen-PDFs und DisplayPage-Content-Slots mussten dieselben Sichtbarkeitsregeln nutzen: angepasst.
- Mehr Kontext in Playlist-Editor und Content-Liste bleibt sinnvoll.

## WordPress-Plugin-Uebernahme

Die bestehende WordPress-Spezifikation muss um folgende Konzepte erweitert werden.

### Neue Custom Post Types

#### `dsb_display_page`

Entspricht `displayPageStore`.

Meta-Felder:

| Meta Key | Typ | Beschreibung |
|---|---|---|
| `_dsb_page_key` | string | z.B. `home`, `shopfloor`, `kantine` |
| `_dsb_nav_group_id` | string | Gruppe in der Display-Navigation |
| `_dsb_layout` | json | Layouttyp, Spalten, Zeilen |
| `_dsb_slots` | json | Slot-Liste mit Quellen |
| `_dsb_duration` | int | Default-Dauer |
| `_dsb_location_ids` | array/json | optionale Standort-Overrides |
| `_dsb_status` | string | `active`, `inactive`, `draft` |

#### `dsb_display_program`

Neu und wichtig. Entspricht `displayProgramStore`.

Meta-Felder:

| Meta Key | Typ | Beschreibung |
|---|---|---|
| `_dsb_program_entries` | json | Sendeschleife: displayPage/systemPage/playlist/autoGroup |
| `_dsb_location_ids` | array/json | Standorte, fuer die das Programm gilt |
| `_dsb_priority` | int | Gewinnerlogik bei mehreren Programmen |
| `_dsb_is_active` | bool | aktiv/inaktiv |
| `_dsb_fallback_program_id` | int/null | optional spaeter |

Entry-Struktur:

```json
{
  "type": "displayPage",
  "targetId": "home",
  "duration": 15,
  "transition": "fade",
  "enabled": true
}
```

#### Bestehende CPTs erweitern

`dsb_schedule` muss `target_type = program` erlauben:

```text
target_type: content | playlist | program
target_id: Post-ID des Zielobjekts
```

`dsb_playlist` sollte im Wording als **Inhaltsplaylist** verstanden werden. Der technische CPT kann `dsb_playlist` bleiben, aber Admin-Texte sollten klar machen: Dies ist nicht die komplette Display-Sendeschleife.

### REST-/Resolver-Logik fuer WordPress

Empfohlene zentrale Display-API:

```text
GET /wp-json/dsb/v1/display-plan?location=fb1&at=2026-04-26T11:30:00
```

Antwort sollte bereits aufgeloest sein:

```json
{
  "location": "fb1",
  "at": "2026-04-26T11:30:00",
  "program": {
    "id": 123,
    "name": "Standardprogramm"
  },
  "pages": [
    {
      "id": "home",
      "label": "HOME",
      "duration": 15,
      "transition": "fade",
      "zones": []
    }
  ],
  "diagnostics": {
    "activePlaylist": "Startseite Standard",
    "visibleContentIds": [],
    "warnings": []
  }
}
```

Wichtig: Der Display-Renderer sollte nicht selbst in WordPress-Posts herumfiltern. Das Plugin braucht eine zentrale Resolver-Schicht:

```text
Content Query
  -> Freigabe
  -> Gültigkeit
  -> Standort-Scope
  -> Zeitplan
  -> Playlist-Auflösung
  -> Programmauswahl
  -> DisplayPlan
```

### WordPress-Capabilities

Neue Capabilities:

```text
dsb_read_display_programs
dsb_edit_display_programs
dsb_delete_display_programs
dsb_manage_display_pages
dsb_preview_display
```

Rollenempfehlung:

| Rolle | Rechte |
|---|---|
| Admin | alles |
| Redakteur | Inhalte, Playlists, Zeitplanung, Vorschau; Programme optional nur lesen oder bearbeiten nach Freigabe |
| Pruefer | Inhalte/Freigaben lesen, Ausspielung pruefen |
| Betrachter | Ausspielung pruefen, Display lesen |

### Admin-Seiten im WordPress-Plugin

Empfohlene Menuestruktur:

```text
DSB Dashboard
DSB Veröffentlichen
DSB Inhaltsbibliothek
DSB Freigaben
DSB Vorlagen
DSB Ausspielung prüfen
DSB Programme
DSB Display-Seiten
DSB Playlists
DSB Zeitplanung
DSB Layouts
DSB Produktion / Shopfloor
DSB Standorte
DSB Notfall
DSB Benutzer/Rollen
DSB Audit-Log
```

Die wichtigste Seite fuer WordPress ist **Ausspielung prüfen**. Sie muss Vertrauen schaffen und die Frage beantworten:

```text
Was läuft auf welchem Display wann und warum?
```

## Noch offen / bewusst nicht vollstaendig geloest

1. **Content-Liste braucht Betriebs-Kontext**
   - Sichtbar auf welchen Standorten?
   - Teil welcher Playlist?
   - Teil welcher Programme?
   - Gerade laufend oder nur freigegeben?

2. **Playlist-Validierung muss Runtime-Kontext kennen**
   - Ein Playlist-Item kann freigegeben sein, aber wegen Standort/Gültigkeit/Zeitplan trotzdem nicht erscheinen.
   - Editor sollte das pro Standort/Zeitpunkt anzeigen.

3. **Programm-Editor kann noch keine konkrete Playlist statt `active` waehlen**
   - Aktuell gibt es den Baustein `Aktive Playlist`.
   - Spaeter sinnvoll: konkrete Playlist waehlen oder Query-Regel definieren.

4. **Display-Seiten-Editor ist aktuell stark auf Home fokussiert**
   - Weitere Seiten sollten schrittweise aus der Runtime in echte DisplayPage-Konfiguration ueberfuehrt werden.

5. **Schedule-Winner-Logik sollte in der UI erklaert werden**
   - Bei mehreren aktiven Programmen/Playlists gewinnt Prioritaet.
   - Bei Gleichstand entscheidet aktuell Reihenfolge im Store.

6. **WordPress-Persistenz braucht Migration/Versionierung**
   - JSON-Meta fuer Slots/Entries ist fuer den Start ok.
   - Bei produktiver Nutzung eventuell eigene Tabellen fuer Programme/Slots/Schedules pruefen.

## Tests / Verifikation

Nach den Aenderungen wurden ausgefuehrt:

```bash
cd dsb
npm test
npm run build
```

Ergebnis:

- `npm test`: 26 Testdateien, 99 Tests bestanden
- `npm run build`: erfolgreich

## Wichtige Dateien

| Zweck | Pfad |
|---|---|
| Display-Runtime / finaler Plan | `dsb/src/shared/composables/useDisplayContent.js` |
| Programmmodell und Resolver | `dsb/src/shared/displayEngine/displayProgramRules.js` |
| Programm-Store | `dsb/src/shared/stores/displayProgramStore.js` |
| Programm-Admin | `dsb/src/admin/pages/DisplayProgramsPage.vue` |
| Display-Seitenmodell | `dsb/src/shared/displayEngine/displayPageBuilder.js` |
| Display-Seiten-Admin | `dsb/src/admin/pages/DisplayPagesPage.vue` |
| Zeitplanung / Agenda | `dsb/src/admin/pages/SchedulePage.vue` |
| Playlist-Editor | `dsb/src/admin/pages/PlaylistEditorPage.vue` |
| Ausspielung pruefen | `dsb/src/admin/pages/DisplaySimulationPage.vue` |
| Admin-Menue | `dsb/src/admin/AdminSidebar.vue` |
| Routen | `dsb/src/router.js` |
| Rechte | `dsb/src/shared/auth/policies.js` |
| WordPress-Spezifikation | `docs/DSB_WordPress_Spezifikation.md` |

## Zusammenfassung fuer spaeter

Die wichtigste Produktentscheidung des Tages:

```text
Nicht Playlist zur grossen Rotation aufblasen.
Stattdessen Display-Programme als eigene Ebene einfuehren.
```

Damit bleibt das System logisch:

- Redakteure erstellen Inhalte.
- Redakteure/Admins kuratieren Inhaltsplaylists.
- Admins bauen Display-Seiten.
- Admins bauen Programme als echte Sendeschleifen.
- Zeitplanung aktiviert Inhalte, Playlists oder Programme.
- Ausspielung prüfen erklaert das Ergebnis.

Diese Struktur sollte 1:1 als Grundlage fuer das WordPress-Plugin dienen.
