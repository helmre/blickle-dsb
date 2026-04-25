# Digitales Schwarzes Brett

Vue-3-Prototyp fuer ein digitales Informationsdisplay-System bei Blickle.

Der Code ist bewusst als fachlicher Prototyp aufgebaut: Er zeigt Rollen, Freigabeprozess, Standortlogik, Display-Vorschau, Templates, Notfallmeldungen und Display-Rotation. Er ersetzt kein produktives Backend. Alle produktionskritischen Grenzen sind dokumentiert und sollen in der IT-Umsetzung durch Server-Auth, API, Datenbank und Dateiablage ersetzt werden.

## Schnellstart

```sh
npm install
npm run dev
```

Admin:

```txt
http://localhost:5173/#/admin
```

Display:

```txt
http://localhost:5173/#/display
http://localhost:5173/#/display/<locationId>
```

## Quality Gate

Vor einer Uebergabe oder Demo ausfuehren:

```sh
npm run check
```

Das fuehrt Tests und Production-Build aus. Fuer eine zusaetzliche Dependency-Pruefung:

```sh
npm run audit:prod
```

## Architekturueberblick

```txt
src/
├── admin/                 Admin-Oberflaeche, Wizard, Freigaben, Stammdaten
├── display/               1920x1080 Display-Shell, Rotation, Zonen
├── shared/
│   ├── auth/              Rollen- und Permission-Matrix
│   ├── composables/       Display-Content-Ableitung und Theme-State
│   ├── displayEngine/     Pure Regeln fuer Sichtbarkeit, Playlists und Nav
│   ├── repositories/      Persistenz-Abstraktion, aktuell localStorage
│   ├── stores/            Pinia-Domain-Stores
│   ├── templates/         Template-Registry und Validierung
│   └── utils/             Storage, Sanitizing, Preview, Datum/Layout
├── router.js              Hash-Routing fuer Admin und Display
└── main.js                Vue/Pinia/Router-Bootstrap
```

## Zentrale Konzepte

- **Content Lifecycle:** `draft -> in_review -> approved -> archived/rejected`
- **Revisionen:** Freigegebene und eingereichte Inhalte sind gesperrt. Aenderungen laufen ueber neue Revisionen.
- **Rollenmodell:** Admin, Editor, Reviewer, Viewer mit zentraler Permission-Matrix.
- **Standortlogik:** Inhalte koennen global oder standortspezifisch ausgespielt werden.
- **Display Engine:** Sichtbarkeit, Playlist-Auswahl und Display-Navigation sind als pure Funktionen testbar.
- **Display-Vorschau:** Der Publish-Wizard kann den aktuellen Entwurf standortbezogen als Display-Preview oeffnen.
- **Template-Sicherheit:** Legacy-HTML wird vor dem Rendern sanitisiert; Designer-Templates sind Vue-Komponenten.
- **Repository-Schicht:** Stores haengen nicht direkt an `localStorage`, sondern an austauschbaren Repository-Adaptern.

## Testabdeckung

Aktuelle automatisierte Tests decken die kritischsten Fachregeln ab:

- Auth-/Permission-Matrix
- Content-Workflow und Revisionen
- Content-Editor Draft-/Workflow-Logik
- Notfall-Persistenz
- Standortvererbung
- Display-Engine und Display-Content-Ableitung
- Display-Simulation mit Entscheidungsdiagnose
- Datumsgueltigkeit
- Layout-Schema
- Template-Validierung

## Produktionsgrenzen

Der Prototyp ist nicht als Produktivsystem freigegeben. Fuer Produktion fehlen absichtlich bzw. prototypisch:

- Serverbasierte Authentifizierung und Autorisierung
- Datenbank mit Migrationen, Backups und Transaktionen
- Datei-/Medienablage ausserhalb des Browser-Speichers
- Servervalidierung fuer alle Store-Aktionen
- Mehrbenutzer-Konfliktloesung
- Geraeteauthentifizierung fuer Displays
- Monitoring, Logging, Deployment- und Rollback-Konzept

Details stehen in [`docs/IT_REVIEW_READINESS.md`](docs/IT_REVIEW_READINESS.md).

## IT-Integrationspaket

Fuer die spaetere Backend-/IT-Umsetzung liegen konkrete Uebergabedokumente im Repo:

- [`docs/IT_INTEGRATION_PLAN.md`](docs/IT_INTEGRATION_PLAN.md) - was wir vorbereiten koennen, was IT liefern muss, empfohlene Phasen
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) - benoetigte REST-Endpunkte, Payloads und Fehlerformat
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) - Entitaeten, Felder, Statusuebergaenge und Referenzen
- [`docs/ROLE_MATRIX.md`](docs/ROLE_MATRIX.md) - Rollen, Permissions und SSO-Mapping
- [`docs/MEDIA_STORAGE_CONCEPT.md`](docs/MEDIA_STORAGE_CONCEPT.md) - Zielbild fuer Uploads, Storage, CDN/Cache und Sicherheit
- [`docs/api/openapi.yaml`](docs/api/openapi.yaml) - OpenAPI-Skelett fuer die Backend-Diskussion

Die Datei [`.env.example`](.env.example) dokumentiert die geplanten Betriebs- und Integrationsschalter.

## Review-Hinweis fuer IT

Dieser Code soll als klickbare Spezifikation und Referenz fuer Fachlogik dienen. Die saubere Produktionsumsetzung sollte die bestehenden Domain-Grenzen uebernehmen, aber Persistenz, Auth, Medien und Realtime-Synchronisierung serverseitig neu aufbauen.
