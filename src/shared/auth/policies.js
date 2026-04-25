export const PERMISSIONS = Object.freeze({
  ADMIN_ACCESS: 'admin:access',
  AUDIT_READ: 'audit:read',
  CONTENT_APPROVE: 'content:approve',
  CONTENT_CREATE: 'content:create',
  CONTENT_DELETE: 'content:delete',
  CONTENT_EDIT: 'content:edit',
  CONTENT_READ: 'content:read',
  CONTENT_SUBMIT: 'content:submit',
  DISPLAY_PAGES_MANAGE: 'display-pages:manage',
  DISPLAY_PROGRAMS_MANAGE: 'display-programs:manage',
  DISPLAY_PREVIEW: 'display:preview',
  EMERGENCY_TRIGGER: 'emergency:trigger',
  LAYOUTS_MANAGE: 'layouts:manage',
  LOCATIONS_MANAGE: 'locations:manage',
  MEDIA_UPLOAD: 'media:upload',
  PLAYLISTS_MANAGE: 'playlists:manage',
  PLAYLISTS_READ: 'playlists:read',
  SCHEDULE_MANAGE: 'schedule:manage',
  SCHEDULE_READ: 'schedule:read',
  SHOPFLOOR_READ: 'shopfloor:read',
  TEMPLATES_READ: 'templates:read',
  USERS_MANAGE: 'users:manage',
})

const ROLE_PERMISSIONS = Object.freeze({
  admin: ['*'],
  editor: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_SUBMIT,
    PERMISSIONS.DISPLAY_PREVIEW,
    PERMISSIONS.DISPLAY_PROGRAMS_MANAGE,
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.PLAYLISTS_MANAGE,
    PERMISSIONS.PLAYLISTS_READ,
    PERMISSIONS.SCHEDULE_MANAGE,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SHOPFLOOR_READ,
    PERMISSIONS.TEMPLATES_READ,
  ],
  reviewer: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.CONTENT_APPROVE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.DISPLAY_PREVIEW,
    PERMISSIONS.PLAYLISTS_READ,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SHOPFLOOR_READ,
    PERMISSIONS.TEMPLATES_READ,
  ],
  viewer: [
    PERMISSIONS.ADMIN_ACCESS,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.DISPLAY_PREVIEW,
    PERMISSIONS.PLAYLISTS_READ,
    PERMISSIONS.SCHEDULE_READ,
    PERMISSIONS.SHOPFLOOR_READ,
  ],
})

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || []
}

export function can(user, permission) {
  if (!permission) return true
  if (!user) return false
  const permissions = permissionsForRole(user.role)
  return permissions.includes('*') || permissions.includes(permission)
}

export function canAny(user, permissions = []) {
  return permissions.some(permission => can(user, permission))
}

export function requirePermission(user, permission) {
  if (can(user, permission)) return true
  const role = user?.role || 'anonymous'
  throw new Error(`Permission denied: ${role} cannot ${permission}`)
}
