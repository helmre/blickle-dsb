# Media Storage Concept

Stand: 2026-04-25

Der Prototyp speichert kleine Designer-Uploads als Data-URL und nutzt Public Assets fuer Demo-Medien. Das ist fuer Demos in Ordnung, aber nicht fuer Produktion. Dieses Dokument beschreibt die Zielarchitektur fuer Bilder, PDFs und Videos.

## Prototyp heute

- Designer-Bilder/Videos werden clientseitig validiert und als Data-URL gespeichert.
- PDF- und Demo-Medien koennen aus `public/` kommen.
- Upload-Grenzen im Prototyp sind bewusst klein, damit localStorage nicht ueberlaeuft.
- PWA-Precache enthaelt kritische Public Assets, Runtime Cache ergaenzt nach Abruf.

## Produktionsziel

```txt
Admin Browser -> Media API -> Virenscan -> Object Storage/File Storage -> CDN/Cache -> Display
```

Content speichert nicht die Datei selbst, sondern nur Referenzen:

```json
{
  "mediaIds": ["media-01H..."],
  "templateParams": {
    "videoUrl": "https://cdn.example.com/dsb/media-01H.mp4",
    "videoPoster": "https://cdn.example.com/dsb/media-01H-poster.jpg"
  }
}
```

## MediaAsset-Modell

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
  "checksum": "sha256:...",
  "createdBy": "user-editor",
  "createdAt": "2026-04-25T20:00:00.000Z"
}
```

## Empfohlene Limits

| Typ | MIME | Empfehlung |
| --- | --- | --- |
| Bild | `image/jpeg`, `image/png`, `image/webp` | max. 10 MB, serverseitig auf Displaygroesse skalieren |
| PDF | `application/pdf` | max. 25 MB, Seitenanzahl pruefen |
| Video | `video/mp4`, optional `video/webm` | max. 250 MB oder redaktionell festlegen |
| Poster | `image/jpeg`, `image/webp` | automatisch aus Video erzeugen |

## Upload-Ablauf

1. Admin waehlt Datei.
2. Client prueft grob MIME-Type und Groesse.
3. `POST /api/v1/media` sendet Multipart Upload.
4. Backend prueft Auth und Permission `media:upload`.
5. Backend speichert Datei temporaer.
6. Virenscan und MIME-Sniffing.
7. Optional: Bildskalierung, Video-Transcoding, Poster-Erzeugung.
8. Backend legt MediaAsset an.
9. Response geht an Frontend.
10. Content speichert MediaAsset-Referenz.

## Display-Auslieferung

Fuer Displays sind stabile, cachebare URLs wichtig:

- Bilder/PDFs/Videos muessen mit Cache-Headern ausgeliefert werden.
- Bei Austausch sollte die URL versioniert sein oder ein neuer MediaAsset entstehen.
- Kritische Tagesinhalte koennen beim Display-Start vorgewaermt werden.
- Offline-Betrieb braucht eine klare Cache-Invalidierungsstrategie.

## Sicherheit

- Keine beliebigen `data:text/html` oder Script-Payloads fuer Link-Felder.
- SVG nur nach explizitem Sanitizing oder gar nicht erlauben.
- PDFs koennen aktive Inhalte enthalten; Anzeige im Browser/PDF.js isoliert halten.
- Externe URLs nur fuer freigegebene Provider erlauben.
- Uploads muessen serverseitig validiert werden, clientseitige Checks sind nur UX.

## Offene IT-Entscheidungen

- Storage-Ziel: Azure Blob, S3-kompatibel, SharePoint, Fileserver?
- Soll ein CDN oder interner Reverse Proxy genutzt werden?
- Wie laeuft Virenscan?
- Welche Maximalgroessen sind betrieblich erlaubt?
- Wie lange bleiben nicht genutzte Medien erhalten?
- Muessen Medien versioniert oder archiviert werden?
- Welche Daten duerfen auf Display-Geraeten offline gecacht werden?

