# API Contract

Stand: 2026-04-25

Dieser Vertrag beschreibt die benoetigte Backend-API fuer die produktive Umsetzung des DSB. Der aktuelle Prototyp nutzt localStorage, ist aber fachlich bereits in Stores und Repository-Grenzen gegliedert. Die API sollte diese Fachoperationen serverseitig absichern.

## Grundsaetze

- Basis-URL: `/api/v1`
- Auth: Cookie-Session oder Bearer Token nach IT-Standard.
- Alle schreibenden Endpunkte pruefen Berechtigungen serverseitig.
- Alle schreibenden Endpunkte erzeugen serverseitige Audit-Eintraege.
- Zeitstempel werden als ISO-8601 UTC gespeichert.
- IDs sind stabile Strings, idealerweise UUID/ULID.
- Fehlerantworten nutzen ein einheitliches Format.

## Fehlerformat

```json
{
  "error": {
    "code": "CONTENT_VALIDATION_FAILED",
    "message": "Inhalt ist noch nicht vollstaendig.",
    "details": {
      "issues": []
    }
  }
}
```

Empfohlene Statuscodes:

- `400` Validierung
- `401` nicht angemeldet
- `403` keine Berechtigung
- `404` nicht gefunden
- `409` Konflikt, z.B. veraltete Version
- `413` Datei zu gross
- `415` Dateityp nicht erlaubt

## Auth

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `GET` | `/auth/me` | Aktuellen Nutzer, Rolle und Permissions laden |
| `POST` | `/auth/logout` | Session beenden |

`GET /auth/me`:

```json
{
  "id": "user-admin",
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": ["*"],
  "locationAccess": []
}
```

## Content

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/contents` | `content:read` | Inhalte listen, Filter via Query |
| `GET` | `/contents/{id}` | `content:read` | Inhalt laden |
| `POST` | `/contents` | `content:create` | Entwurf erstellen |
| `PATCH` | `/contents/{id}` | `content:edit` | Entwurf bearbeiten |
| `DELETE` | `/contents/{id}` | `content:delete` | Entwurf loeschen |
| `POST` | `/contents/{id}/revision` | `content:edit` | Neue Revision aus gesperrtem Inhalt |
| `POST` | `/contents/{id}/submit` | `content:submit` | Zur Pruefung einreichen |
| `POST` | `/contents/{id}/approve` | `content:approve` | Freigeben |
| `POST` | `/contents/{id}/reject` | `content:approve` | Ablehnen |

Create/Update Payload:

```json
{
  "title": "Neue Maschinenhalle",
  "description": "Kurzbeschreibung",
  "type": "template",
  "templateId": "tpl-video-news",
  "templateParams": {},
  "tags": ["produktion"],
  "validFrom": "2026-05-01T00:00:00.000Z",
  "validUntil": "2026-05-31T23:59:59.000Z",
  "locationIds": ["loc-halle1"],
  "mediaIds": []
}
```

Review Command Payload:

```json
{
  "comment": "Passt fachlich.",
  "expectedVersion": 3
}
```

## Templates

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/templates` | `templates:read` | Template-Katalog laden |
| `GET` | `/templates/{id}` | `templates:read` | Template laden |
| `POST` | `/templates` | Admin | Template anlegen |
| `PATCH` | `/templates/{id}` | Admin | Template bearbeiten |
| `DELETE` | `/templates/{id}` | Admin | Template entfernen |

Produktion sollte bevorzugt kuratierte Templates ausliefern. Freies HTML/CSS bleibt Sonderfall und muss serverseitig validiert werden.

## Playlists

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/playlists` | `playlists:read` | Playlists listen |
| `GET` | `/playlists/{id}` | `playlists:read` | Playlist laden |
| `POST` | `/playlists` | `playlists:manage` | Playlist anlegen |
| `PATCH` | `/playlists/{id}` | `playlists:manage` | Metadaten bearbeiten |
| `DELETE` | `/playlists/{id}` | `playlists:manage` | Playlist loeschen |
| `PUT` | `/playlists/{id}/items` | `playlists:manage` | Reihenfolge/Items ersetzen |

Playlist Item:

```json
{
  "id": "pli-1",
  "contentId": "content-1",
  "duration": 15,
  "order": 1,
  "transition": "fade"
}
```

## Schedules

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/schedules` | `schedule:read` | Zeitplaene listen |
| `GET` | `/schedules/{id}` | `schedule:read` | Zeitplan laden |
| `POST` | `/schedules` | `schedule:manage` | Zeitplan anlegen |
| `PATCH` | `/schedules/{id}` | `schedule:manage` | Zeitplan bearbeiten |
| `DELETE` | `/schedules/{id}` | `schedule:manage` | Zeitplan loeschen |

Schedule Payload:

```json
{
  "targetType": "content",
  "targetId": "content-1",
  "locationIds": ["loc-halle1"],
  "startDate": "2026-05-01",
  "endDate": "2026-05-31",
  "timeWindows": [{ "start": "22:00", "end": "06:00" }],
  "weekdays": [1, 2, 3, 4, 5],
  "priority": 10,
  "isActive": true
}
```

## Locations

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/locations` | `admin:access` | Standortbaum laden |
| `POST` | `/locations` | `locations:manage` | Standort anlegen |
| `PATCH` | `/locations/{id}` | `locations:manage` | Standort bearbeiten |
| `DELETE` | `/locations/{id}` | `locations:manage` | Standort loeschen, nur ohne Referenzen |

Loeschen muss serverseitig blockieren, wenn Kinder oder Referenzen existieren.

## Layouts

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/layouts` | `admin:access` | Layouts listen |
| `POST` | `/layouts` | `layouts:manage` | Layout anlegen |
| `PATCH` | `/layouts/{id}` | `layouts:manage` | Layout bearbeiten |
| `DELETE` | `/layouts/{id}` | `layouts:manage` | Layout loeschen |

## Users

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/users` | `users:manage` | Benutzer listen |
| `POST` | `/users` | `users:manage` | Benutzer/Rolle zuordnen |
| `PATCH` | `/users/{id}` | `users:manage` | Benutzer bearbeiten |
| `DELETE` | `/users/{id}` | `users:manage` | Benutzer entfernen |

Bei SSO kann `POST /users` eine lokale Rollen-/Standortzuordnung fuer externe Identitaeten sein.

## Emergencies

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/emergencies` | `emergency:trigger` | Historie laden |
| `GET` | `/emergencies/active` | Display/Auth je nach Ziel | Aktiven Notfall laden |
| `POST` | `/emergencies` | `emergency:trigger` | Notfall ausloesen |
| `POST` | `/emergencies/{id}/dismiss` | `emergency:trigger` | Notfall beenden |

Trigger Payload:

```json
{
  "message": "Bitte Halle 1 verlassen.",
  "severity": "critical",
  "targetLocationIds": ["loc-halle1"],
  "displayDuration": 300
}
```

## Media

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `POST` | `/media` | `media:upload` | Datei hochladen |
| `GET` | `/media/{id}` | Auth oder signierte URL | Metadaten laden |
| `DELETE` | `/media/{id}` | Admin/Owner | Nicht genutztes Asset entfernen |

Response:

```json
{
  "id": "media-01H...",
  "url": "https://cdn.example.com/dsb/media-01H.mp4",
  "mimeType": "video/mp4",
  "size": 12345678,
  "width": 1920,
  "height": 1080,
  "duration": 42.5,
  "posterUrl": "https://cdn.example.com/dsb/media-01H-poster.jpg",
  "checksum": "sha256:..."
}
```

## Display

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `GET` | `/display/{locationId}/payload` | Display-spezifischen Payload laden |
| `GET` | `/display/devices/{deviceId}` | Device-Standort und Konfiguration laden |
| `POST` | `/display/devices/{deviceId}/heartbeat` | Betriebsstatus melden |

Minimaler Display Payload:

```json
{
  "location": {},
  "contents": [],
  "playlists": [],
  "schedules": [],
  "layout": {},
  "activeEmergency": null,
  "generatedAt": "2026-04-25T20:00:00.000Z"
}
```

## Audit

| Methode | Pfad | Permission | Zweck |
| --- | --- | --- | --- |
| `GET` | `/audit-log` | `audit:read` | Audit lesen |

Audit-Eintraege werden nicht vom Client erstellt, sondern durch Backend-Commands.

