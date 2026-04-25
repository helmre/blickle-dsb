import { createLocalRepository } from './localRepository.js'
import {
  getSeedAuditLog,
  getSeedContent,
  getSeedDisplayPrograms,
  getSeedLayouts,
  getSeedLocations,
  getSeedPlaylists,
  getSeedTemplates,
  getSeedUsers,
} from '../utils/seedData.js'
import { getDefaultDisplayPages } from '../displayEngine/displayPageDefaults.js'

export const auditRepository = createLocalRepository('auditLog', getSeedAuditLog)
export const contentRepository = createLocalRepository('content', getSeedContent)
export const currentUserRepository = createLocalRepository('currentUser', 'user-admin')
export const displayPageRepository = createLocalRepository('display_pages', getDefaultDisplayPages)
export const displayProgramRepository = createLocalRepository('display_programs', getSeedDisplayPrograms)
export const emergencyRepository = createLocalRepository('emergencies', [])
export const layoutRepository = createLocalRepository('layouts', getSeedLayouts)
export const locationRepository = createLocalRepository('locations', getSeedLocations)
export const playlistRepository = createLocalRepository('playlists', getSeedPlaylists)
export const scheduleRepository = createLocalRepository('schedules', [])
export const templateRepository = createLocalRepository('templates', getSeedTemplates)
export const userRepository = createLocalRepository('users', getSeedUsers)
