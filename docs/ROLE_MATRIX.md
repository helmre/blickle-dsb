# Role Matrix

Stand: 2026-04-25

Quelle im Code: `src/shared/auth/policies.js`

## Rollen

| Rolle | Zweck |
| --- | --- |
| `admin` | Vollzugriff, Stammdaten, Benutzer, Notfall, Layouts |
| `editor` | Inhalte erstellen, bearbeiten, einreichen, Playlists/Zeitplanung pflegen |
| `reviewer` | Inhalte pruefen, freigeben/ablehnen, Audit lesen |
| `viewer` | Nur lesender Zugriff auf Admin-Ansichten und Vorschau |

## Permissions

| Permission | Admin | Editor | Reviewer | Viewer |
| --- | --- | --- | --- | --- |
| `admin:access` | ja | ja | ja | ja |
| `audit:read` | ja | nein | ja | nein |
| `content:approve` | ja | nein | ja | nein |
| `content:create` | ja | ja | nein | nein |
| `content:delete` | ja | ja | nein | nein |
| `content:edit` | ja | ja | nein | nein |
| `content:read` | ja | ja | ja | ja |
| `content:submit` | ja | ja | nein | nein |
| `display:preview` | ja | ja | ja | ja |
| `emergency:trigger` | ja | nein | nein | nein |
| `layouts:manage` | ja | nein | nein | nein |
| `locations:manage` | ja | nein | nein | nein |
| `media:upload` | ja | ja | nein | nein |
| `playlists:manage` | ja | ja | nein | nein |
| `playlists:read` | ja | ja | ja | ja |
| `schedule:manage` | ja | ja | nein | nein |
| `schedule:read` | ja | ja | ja | ja |
| `shopfloor:read` | ja | ja | ja | ja |
| `templates:read` | ja | ja | ja | nein |
| `users:manage` | ja | nein | nein | nein |

Admin hat im Code aktuell Wildcard `*`.

## Routen und Permissions

| Route | Permission |
| --- | --- |
| `/#/admin` | `admin:access` |
| `/#/admin/publish` | `content:create` |
| `/#/admin/display-simulation` | `display:preview` |
| `/#/admin/content` | `content:read` |
| `/#/admin/content/:id` | `content:read` |
| `/#/admin/playlists` | `playlists:read` |
| `/#/admin/playlists/:id` | `playlists:read` |
| `/#/admin/schedule` | `schedule:read` |
| `/#/admin/emergency` | `emergency:trigger` |
| `/#/admin/locations` | `locations:manage` |
| `/#/admin/layouts` | `layouts:manage` |
| `/#/admin/templates` | `content:create` |
| `/#/admin/shopfloor-demo` | `shopfloor:read` |
| `/#/admin/approvals` | `content:approve` |
| `/#/admin/users` | `users:manage` |
| `/#/admin/audit-log` | `audit:read` |

## Produktionsregeln

- Die UI darf Buttons ausblenden, aber das Backend muss jede Permission erneut pruefen.
- Rollen duerfen nicht aus localStorage kommen.
- Demo-User-Switch darf in produktionsnahen Umgebungen nicht aktiv sein.
- Eigene Rollen-/Rechteaenderungen muessen sofort wirksam sein.
- Notfallrechte sollten besonders restriktiv bleiben.
- Reviewer duerfen Inhalte lesen und bewerten, aber nicht redaktionell veraendern.

## SSO-Mapping

Empfohlenes Mapping fuer IT:

| SSO-Gruppe | App-Rolle |
| --- | --- |
| `DSB_Admins` | `admin` |
| `DSB_Redaktion` | `editor` |
| `DSB_Pruefung` | `reviewer` |
| `DSB_Lesen` | `viewer` |

Falls Standortrechte gebraucht werden, sollten sie als separate Claims oder Backend-Zuordnung gepflegt werden:

```json
{
  "role": "editor",
  "locationAccess": ["loc-halle1", "loc-halle2"]
}
```

