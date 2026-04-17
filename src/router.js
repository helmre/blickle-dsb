import { createRouter, createWebHashHistory } from 'vue-router'

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
      { path: '', name: 'admin-dashboard', component: () => import('./admin/pages/DashboardPage.vue') },
      { path: 'content', name: 'admin-content', component: () => import('./admin/pages/ContentListPage.vue') },
      { path: 'content/:id', name: 'admin-content-detail', component: () => import('./admin/pages/ContentEditorPage.vue') },
      { path: 'playlists', name: 'admin-playlists', component: () => import('./admin/pages/PlaylistListPage.vue') },
      { path: 'playlists/:id', name: 'admin-playlist-editor', component: () => import('./admin/pages/PlaylistEditorPage.vue') },
      { path: 'schedule', name: 'admin-schedule', component: () => import('./admin/pages/SchedulePage.vue') },
      { path: 'emergency', name: 'admin-emergency', component: () => import('./admin/pages/EmergencyPage.vue') },
      { path: 'locations', name: 'admin-locations', component: () => import('./admin/pages/LocationListPage.vue') },
      { path: 'layouts', name: 'admin-layouts', component: () => import('./admin/pages/LayoutEditorPage.vue') },
      { path: 'templates', name: 'admin-templates', component: () => import('./admin/pages/TemplateCatalogPage.vue') },
      { path: 'shopfloor-demo', name: 'admin-shopfloor-demo', component: () => import('./admin/pages/ShopfloorBoardDemoPage.vue') },
      { path: 'approvals', name: 'admin-approvals', component: () => import('./admin/pages/ApprovalQueuePage.vue') },
      { path: 'users', name: 'admin-users', component: () => import('./admin/pages/UserManagementPage.vue') },
      { path: 'audit-log', name: 'admin-audit-log', component: () => import('./admin/pages/AuditLogPage.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
