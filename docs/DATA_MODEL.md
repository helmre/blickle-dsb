# Data Model

Stand: 2026-04-25

Dieses Dokument beschreibt das fachliche Datenmodell des Prototyps als Vorlage fuer Datenbanktabellen, DTOs und API-Schemas.

## Allgemeine Regeln

- IDs sind stabile Strings.
- `createdAt`, `updatedAt`, `submittedAt`, `publishedAt`, `triggeredAt`, `acknowledgedAt` sind ISO-Zeitstempel.
- Datumsfelder ohne Uhrzeit (`startDate`, `endDate`) werden fachlich als lokale Kalendertage behandelt.
- Referenzen muessen serverseitig geprueft werden.
- Schreiboperationen muessen Audit-Eintraege erzeugen.

## Content

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `title` | string | ja | Anzeigename im Admin |
| `description` | string | nein | Beschreibung |
| `type` | string | ja | `template`, `pdf`, `image`, `video`, etc. |
| `templateId` | string | bei Template | Referenz auf Template |
| `templateParams` | object | nein | Parameter fuer Designer-/Legacy-Template |
| `fileUrl` | string | bei Datei | Prototyp: Data-/Public-URL; Produktion: Media URL |
| `mediaIds` | string[] | nein | Zukuenftige MediaAsset-Referenzen |
| `mimeType` | string | nein | MIME-Type |
| `tags` | string[] | nein | Admin-Filter |
| `status` | enum | ja | `draft`, `in_review`, `approved`, `rejected`, `archived` |
| `validFrom` | string/null | nein | Start der fachlichen Gueltigkeit |
| `validUntil` | string/null | nein | Ende der fachlichen Gueltigkeit |
| `locationIds` | string[] | nein | Leer bedeutet global |
| `createdBy` | string | ja | User-ID |
| `reviewVersion` | number | ja | Zaehler fuer Review-Runden |
| `reviewEvents` | ReviewEvent[] | nein | Verlauf |
| `revisionOf` | string/null | nein | Ursprungsinhalt |
| `basedOnContentId` | string/null | nein | Vorlage dieser Revision |
| `replacesContentId` | string/null | nein | Freigegebener Inhalt, der ersetzt wird |

### Content Statusuebergaenge

```txt
draft -> in_review -> approved
draft -> in_review -> rejected -> draft
approved -> new draft revision -> in_review -> approved
in_review -> new draft revision, alte Review wird archived
```

Gesperrte Status:

- `in_review`
- `approved`
- `archived`

Diese Inhalte duerfen nicht direkt bearbeitet werden. Aenderungen laufen ueber Revisionen.

## ReviewEvent

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Event-ID |
| `type` | enum | ja | `submitted`, `approved`, `rejected`, `revision_started` |
| `comment` | string | nein | Kommentar |
| `createdAt` | string | ja | Zeitpunkt |
| `userId` | string | ja | Ausloesender Nutzer |
| `userName` | string | nein | Denormalisiert fuer Anzeige |

## Playlist

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `name` | string | ja | Name |
| `description` | string | nein | Beschreibung |
| `loop` / `isLoop` | boolean | ja | Wiederholung; beide Felder existieren fuer Legacy-Kompatibilitaet |
| `priority` | number | nein | Auswahlprioritaet |
| `items` | PlaylistItem[] | ja | Reihenfolge |
| `createdAt` | string | ja | Erstellt |
| `updatedAt` | string | ja | Aktualisiert |

## PlaylistItem

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Item-ID |
| `contentId` | string | ja | Referenz auf Content |
| `duration` | number | ja | Sekunden |
| `order` | number | ja | Reihenfolge |
| `transition` | string | nein | z.B. `fade` |

## Schedule

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `targetType` | enum | ja | `content` oder `playlist` |
| `targetId` | string | ja | Ziel-ID |
| `locationIds` | string[] | nein | Standortfilter, leer/global |
| `startDate` | string/null | nein | Startdatum |
| `endDate` | string/null | nein | Enddatum |
| `timeWindows` | object[] | nein | Zeitfenster, auch ueber Mitternacht |
| `weekdays` | number[] | nein | 0=Sonntag bis 6=Samstag |
| `priority` | number | nein | Auswahlprioritaet |
| `isActive` | boolean | ja | Aktiv |

## Location

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `name` | string | ja | Standortname |
| `parentId` | string/null | nein | Hierarchie |
| `layoutId` | string | nein | Default-Layout |
| `timezone` | string | nein | z.B. `Europe/Berlin` |
| `isActive` | boolean | ja | Aktiv |
| `zoneAssignments` | object[] | nein | Display-Zonen |

Standorte duerfen nur geloescht werden, wenn keine Kinder und keine Referenzen mehr existieren.

## Layout

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `name` | string | ja | Name |
| `gridColumns` | number | ja | Grid-Spalten |
| `gridRows` | number | ja | Grid-Zeilen |
| `zones` | LayoutZone[] | ja | Zonen |

## LayoutZone

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Zone-ID |
| `name` | string | ja | Anzeigename |
| `gridColumnStart` | number | ja | CSS Grid Start |
| `gridColumnEnd` | number | ja | CSS Grid Ende |
| `gridRowStart` | number | ja | CSS Grid Start |
| `gridRowEnd` | number | ja | CSS Grid Ende |

## Template

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `name` | string | ja | Template-Name |
| `category` | string | nein | Kataloggruppe |
| `kind` | enum | nein | `designer` oder `legacy` |
| `designerComponent` | string | bei Designer | Vue-Komponente |
| `htmlTemplate` | string | bei Legacy | Sanitisiertes HTML-Template |
| `cssTemplate` | string | bei Legacy | Gescope/validiert |
| `parameters` | object[] | nein | Parameter-Schema |
| `defaultParams` | object | nein | Defaults |

## User

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Interne oder externe User-ID |
| `name` | string | ja | Anzeigename |
| `email` | string | ja | E-Mail |
| `role` | enum | ja | `admin`, `editor`, `reviewer`, `viewer` |
| `locationAccess` | string[] | nein | Optionaler Standortfilter |
| `avatar` | string | nein | Anzeige |

Bei SSO sollte `id` auf eine stabile externe Identitaet gemappt werden.

## Emergency

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `message` | string | ja | Meldung |
| `severity` | enum | ja | `warning`, `critical`, `emergency` |
| `targetLocationIds` | string[] | nein | Leer/global |
| `displayDuration` | number | ja | Sekunden |
| `triggeredBy` | string | ja | User-ID |
| `triggeredAt` | string | ja | Zeitpunkt |
| `expiresAt` | string | ja | Ablauf |
| `acknowledgedAt` | string/null | nein | Manuell beendet |
| `acknowledgedBy` | string/null | nein | User-ID |

## AuditEntry

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Primaerschluessel |
| `action` | string | ja | z.B. `content.approved` |
| `entityType` | string | ja | z.B. `content` |
| `entityId` | string | ja | Ziel-ID |
| `userId` | string | ja | Ausloesender Nutzer |
| `timestamp` | string | ja | Zeitpunkt |
| `details` | object | nein | Zusatzaussagen |

Produktion: Audit muss serverseitig und manipulationsgeschuetzt sein.

## MediaAsset

Noch nicht produktiv implementiert, aber fuer die IT-Zielarchitektur empfohlen.

| Feld | Typ | Pflicht | Beschreibung |
| --- | --- | --- | --- |
| `id` | string | ja | Asset-ID |
| `url` | string | ja | Auslieferungs-URL oder signierte URL |
| `mimeType` | string | ja | MIME-Type |
| `size` | number | ja | Bytes |
| `width` | number | nein | Bilder/Video |
| `height` | number | nein | Bilder/Video |
| `duration` | number | nein | Video/Audio |
| `posterUrl` | string | nein | Video-Poster |
| `checksum` | string | ja | Integritaet |
| `createdBy` | string | ja | User-ID |
| `createdAt` | string | ja | Zeitpunkt |
| `usageCount` | number | nein | Aufraeumhilfe |

