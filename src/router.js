import { createRouter, createWebHashHistory } from 'vue-router'
import { PERMISSIONS, can } from './shared/auth/policies.js'
import { useUserStore } from './shared/stores/userStore.js'

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/display/:locationId?',
    name: 'display',
    component: () => import('./display/DisplayShell.vue')
  },
  {
    path: '/admin',
    component: () => import('./admin/AdminShell.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('./admin/pages/DashboardPage.vue'), meta: { permission: PERMISSIONS.ADMIN_ACCESS } },
      { path: 'publish', name: 'admin-publish', component: () => import('./admin/pages/PublishWizardPage.vue'), meta: { permission: PERMISSIONS.CONTENT_CREATE } },
      { path: 'display-simulation', name: 'admin-display-simulation', component: () => import('./admin/pages/DisplaySimulationPage.vue'), meta: { permission: PERMISSIONS.DISPLAY_PREVIEW } },
      { path: 'display-programs', name: 'admin-display-programs', component: () => import('./admin/pages/DisplayProgramsPage.vue'), meta: { permission: PERMISSIONS.DISPLAY_PROGRAMS_MANAGE } },
      { path: 'display-pages', name: 'admin-display-pages', component: () => import('./admin/pages/DisplayPagesPage.vue'), meta: { permission: PERMISSIONS.DISPLAY_PAGES_MANAGE } },
      { path: 'content', name: 'admin-content', component: () => import('./admin/pages/ContentListPage.vue'), meta: { permission: PERMISSIONS.CONTENT_READ } },
      { path: 'content/:id', name: 'admin-content-detail', component: () => import('./admin/pages/ContentEditorPage.vue'), meta: { permission: PERMISSIONS.CONTENT_READ } },
      { path: 'playlists', name: 'admin-playlists', component: () => import('./admin/pages/PlaylistListPage.vue'), meta: { permission: PERMISSIONS.PLAYLISTS_READ } },
      { path: 'playlists/:id', name: 'admin-playlist-editor', component: () => import('./admin/pages/PlaylistEditorPage.vue'), meta: { permission: PERMISSIONS.PLAYLISTS_READ } },
      { path: 'schedule', name: 'admin-schedule', component: () => import('./admin/pages/SchedulePage.vue'), meta: { permission: PERMISSIONS.SCHEDULE_READ } },
      { path: 'emergency', name: 'admin-emergency', component: () => import('./admin/pages/EmergencyPage.vue'), meta: { permission: PERMISSIONS.EMERGENCY_TRIGGER } },
      { path: 'locations', name: 'admin-locations', component: () => import('./admin/pages/LocationListPage.vue'), meta: { permission: PERMISSIONS.LOCATIONS_MANAGE } },
      { path: 'layouts', name: 'admin-layouts', component: () => import('./admin/pages/LayoutEditorPage.vue'), meta: { permission: PERMISSIONS.LAYOUTS_MANAGE } },
      { path: 'templates', name: 'admin-templates', component: () => import('./admin/pages/TemplateCatalogPage.vue'), meta: { permission: PERMISSIONS.CONTENT_CREATE } },
      { path: 'shopfloor-demo', name: 'admin-shopfloor-demo', component: () => import('./admin/pages/ShopfloorBoardDemoPage.vue'), meta: { permission: PERMISSIONS.SHOPFLOOR_READ } },
      { path: 'approvals', name: 'admin-approvals', component: () => import('./admin/pages/ApprovalQueuePage.vue'), meta: { permission: PERMISSIONS.CONTENT_APPROVE } },
      { path: 'users', name: 'admin-users', component: () => import('./admin/pages/UserManagementPage.vue'), meta: { permission: PERMISSIONS.USERS_MANAGE } },
      { path: 'audit-log', name: 'admin-audit-log', component: () => import('./admin/pages/AuditLogPage.vue'), meta: { permission: PERMISSIONS.AUDIT_READ } },
      { path: 'forbidden', name: 'admin-forbidden', component: () => import('./admin/pages/ForbiddenPage.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const permission = to.meta?.permission
  if (!permission) return true
  const userStore = useUserStore()
  if (can(userStore.currentUser, permission)) return true
  return { name: 'admin-forbidden', query: { from: to.fullPath } }
})

export default router
