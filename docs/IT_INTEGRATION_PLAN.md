# IT Integration Plan

Stand: 2026-04-25

Dieses Dokument beschreibt, wie der Vue-Prototyp als klickbare Spezifikation in eine produktionsfaehige IT-Loesung ueberfuehrt werden kann. Ziel ist nicht, den Prototyp direkt produktiv zu nehmen. Ziel ist, Fachlogik, UI-Verhalten und Vertrage so vorzubereiten, dass Backend, Auth, Datenbank und Medienablage spaeter mit wenig Interpretationsaufwand angeschlossen werden koennen.

## Zielbild

Der Prototyp bleibt die fachliche Referenz fuer:

- Admin-Workflows: Inhalte, Freigabe, Zeitplanung, Playlists, Notfaelle, Standorte, Benutzer.
- Display-Verhalten: Standortfilter, Seitenrotation, Playlists, Notfall-Overlay, Offline-Fallback.
- Rollenmodell: Admin, Editor, Reviewer, Viewer.
- Datenmodell und Statusuebergaenge.
- API-Vertrag fuer die spaetere Backend-Umsetzung.

Produktion ersetzt dabei nur die technischen Prototyp-Grenzen:

- localStorage wird API + Datenbank.
- Data-URL/Public-Medien werden Media-Service + Dateiablage.
- Demo-User-Switch und Client-Passwort werden SSO/Session.
- Clientseitiges Audit wird serverseitiges, manipulationssicheres Audit.

## Was wir ohne IT vorbereiten koennen

| Bereich | Vorbereitung im Repo | Ergebnis |
| --- | --- | --- |
| API-Vertrag | Endpunkte, Payloads, Fehlercodes und OpenAPI-Skelett dokumentieren | IT weiss exakt, welche Backend-Funktionen benoetigt werden |
| Datenmodell | Entitaeten, Pflichtfelder, Referenzen, Statusuebergaenge beschreiben | Datenbank-Schema kann direkt abgeleitet werden |
| Repository-Schicht | Stores nutzen bereits `shared/repositories` statt direkte Storage-Zugriffe | API-Adapter kann spaeter hinter dieselbe Grenze |
| Rollen | Permission-Matrix zentral dokumentieren und testen | SSO-/Backend-Rollen koennen gemappt werden |
| Medien | Upload-Contract und MediaAsset-Modell definieren | IT kann Storage/Virenscan/CDN planen |
| Quality Gate | Tests, Build, Audit und Abnahmefaelle dokumentieren | Uebergabe wird pruefbar |
| Betriebsdoku | Env-Beispiele, Deployment-Hinweise, Offline-Konzept | Betrieb kann Anforderungen frueh einschaetzen |
| Mock-Backend | Optionaler HTTP-Mock gegen den API-Vertrag | Frontend kann schon vor Backend gegen HTTP getestet werden |

## Was IT wirklich liefern muss

| Bereich | Warum IT erforderlich ist |
| --- | --- |
| Auth/SSO | Unternehmens-Identity, Rollen, Session, Logout, MFA, serverseitige Rechtepruefung |
| Datenbank | Schema, Migrationen, Backup, Retention, Transaktionen, Berechtigungen |
| Medienablage | Storage-Ziel, Virenscan, Dateigroessen, CDN/Cache, Datenschutz |
| Server/API | Hosting, TLS, Netzwerk, Rate Limits, Logging, Monitoring |
| Display-Geraete | Kiosk-Modus, Geraeteidentitaet, Standortbindung, Autostart, Updates |
| Datenschutz/Betriebsrat | Mitarbeiterfotos, Besucherdaten, Audit-Retention, Sichtbarkeit |
| Notfallprozess | Wer darf ausloesen, wer darf beenden, Protokollierung, Eskalation |

## Empfohlene Umsetzungsphasen

### Phase 1: Vertragsklarheit

- `docs/API_CONTRACT.md` final mit IT reviewen.
- `docs/DATA_MODEL.md` in Datenbankmodell uebersetzen.
- Rollen in `docs/ROLE_MATRIX.md` gegen HR/IT/Betriebsrat pruefen.
- Medienkonzept in `docs/MEDIA_STORAGE_CONCEPT.md` abnehmen.

Ergebnis: IT kann Schaetzung, Architektur und Sicherheitscheck erstellen.

### Phase 2: API-Adapter und Mock

- Frontend bleibt fachlich gleich.
- Neuer Adapter hinter `src/shared/repositories/`.
- Umschaltung per Env:
  - `VITE_DSB_DATA_SOURCE=local`
  - `VITE_DSB_DATA_SOURCE=api`
- Optional: Mock-Server mit Seed-Daten und denselben Endpunkten.

Ergebnis: Frontend spricht schon HTTP, ohne auf das echte Backend warten zu muessen.

### Phase 3: Backend-MVP

Minimal benoetigte Services:

- Auth/session: `/auth/me`, `/auth/logout`
- Content: CRUD, Revision, Submit, Approve, Reject
- Schedules/Playlists/Locations
- Emergency: Trigger/Dismiss/Active
- Media: Upload + Asset-Metadaten
- Audit: serverseitiges Log

Ergebnis: Prototyp kann in eine produktionsnahe Testumgebung.

### Phase 4: Display-Betrieb

- Display-Geraete erhalten eindeutige Device-ID.
- Backend bindet Device an Standort.
- Display-Payload wird serverseitig vorbereitet oder vom Client aus API-Daten abgeleitet.
- Offline-Cache wird gezielt vorgewaermt.

Ergebnis: Dauertest auf echten Monitoren.

### Phase 5: Produktionshaertung

- Monitoring und Alerting.
- Backup/Restore-Test.
- Datenschutzfreigabe.
- Rollback-Strategie.
- Last-/Langlauftest fuer Displays.
- Admin-Abnahme mit Checkliste.

## Repository-Grenzen fuer die IT

Aktuell:

```txt
Pinia Store -> shared/repositories/appRepositories.js -> localRepository.js -> localStorage
```

Ziel:

```txt
Pinia Store -> shared/repositories/appRepositories.js -> apiRepository.js -> Backend API
```

Die Store-Methoden sollten als fachliche Methoden erhalten bleiben:

- `contentStore.submitForReview`
- `contentStore.approve`
- `playlistStore.addItem`
- `scheduleStore.removeForTarget`
- `emergencyStore.trigger`
- `emergencyStore.dismiss`

Spaeter kann ein API-Repository diese Aktionen entweder als Entity-Save oder als dedizierte Command-Endpunkte abbilden.

## Definition of Ready fuer IT

Bevor IT implementiert, sollten diese Punkte geklaert sein:

- Welche Standorte/Displays gibt es initial?
- Welche Nutzergruppen entsprechen den Rollen Admin/Editor/Reviewer/Viewer?
- Wo sollen Medien liegen?
- Welche Dateitypen sind erlaubt?
- Wie lange muessen Audit-Eintraege aufbewahrt werden?
- Muessen Notfallmeldungen revisionssicher protokolliert werden?
- Welche Offline-Dauer muss ein Display ueberstehen?
- Soll es Realtime-Updates geben oder reicht Polling?

## Definition of Done fuer Produktions-MVP

- Serverbasierte Authentifizierung und Autorisierung.
- Datenbank statt localStorage.
- Medien-Upload mit Storage und Virenscan.
- Servervalidierung fuer Publish/Freigabe/Notfall.
- Audit wird serverseitig geschrieben.
- Display kann nach Neustart seinen Standort laden.
- Offline-Fallback ist getestet.
- `npm run check` ist gruen.
- Backend-Tests und API-Contract-Tests sind gruen.

