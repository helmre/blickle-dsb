<script setup>
import { useRoute } from 'vue-router'
import { useContentStore } from '../shared/stores/contentStore.js'

const route = useRoute()
const contentStore = useContentStore()

const navSections = [
  {
    items: [
      { label: 'Dashboard', icon: 'dashboard', to: '/admin', name: 'admin-dashboard' },
      { label: 'Inhalte', icon: 'content', to: '/admin/content', name: 'admin-content' },
      { label: 'Playlists', icon: 'playlist', to: '/admin/playlists', name: 'admin-playlists' },
      { label: 'Zeitplanung', icon: 'schedule', to: '/admin/schedule', name: 'admin-schedule' },
      { label: 'Notfall', icon: 'emergency', to: '/admin/emergency', name: 'admin-emergency' },
    ]
  },
  {
    items: [
      { label: 'Vorlagen-Katalog', icon: 'template', to: '/admin/templates', name: 'admin-templates' },
      { label: 'Standorte', icon: 'location', to: '/admin/locations', name: 'admin-locations' },
      { label: 'Layouts', icon: 'layout', to: '/admin/layouts', name: 'admin-layouts' },
      { label: 'Shopfloor', icon: 'shopfloor', to: '/admin/shopfloor-demo', name: 'admin-shopfloor-demo' },
    ]
  },
  {
    items: [
      { label: 'Freigaben', icon: 'approval', to: '/admin/approvals', name: 'admin-approvals', badge: true },
      { label: 'Benutzer', icon: 'users', to: '/admin/users', name: 'admin-users' },
      { label: 'Audit-Log', icon: 'audit', to: '/admin/audit-log', name: 'admin-audit-log' },
    ]
  }
]

function isActive(item) {
  if (route.name === item.name) return true
  if (item.name === 'admin-content' && route.name === 'admin-content-detail') return true
  if (item.name === 'admin-playlists' && route.name === 'admin-playlist-editor') return true
  return false
}

const icons = {
  dashboard: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="7" height="8" rx="2"/><rect x="11" y="2" width="7" height="5" rx="2"/><rect x="2" y="12" width="7" height="6" rx="2"/><rect x="11" y="9" width="7" height="9" rx="2"/></svg>`,
  content: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M12 2v5h5"/><path d="M7 11h6M7 14h4"/></svg>`,
  playlist: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h10M3 9h7"/><path d="M3 13h5"/><circle cx="15" cy="13" r="3"/><path d="M18 13V6"/></svg>`,
  schedule: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="16" height="15" rx="2"/><path d="M6 1v4M14 1v4M2 8h16"/><circle cx="10" cy="13" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  emergency: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L1.5 17h17L10 2Z"/><path d="M10 8v4"/><circle cx="10" cy="14.5" r="0.7" fill="currentColor" stroke="none"/></svg>`,
  location: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h14M5 18V8l5-5 5 5v10"/><path d="M9 18v-4h2v4"/></svg>`,
  layout: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 8h16M9 8v10"/></svg>`,
  template: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="16" height="16" rx="2"/><path d="M2 6h16"/><path d="M6 6v12"/><path d="M9 10h6M9 13h4"/></svg>`,
  shopfloor: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="16" height="13" rx="1.5"/><path d="M2 7h16"/><path d="M5 11h2M9 11h2M13 11h2"/><path d="M5 13v1M9 13v1M13 13v1"/><path d="M7 16v2M13 16v2"/><path d="M5 18h10"/></svg>`,
  approval: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="8"/><path d="M7 10l2 2 4-4"/></svg>`,
  users: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6" r="3"/><path d="M2 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="15" cy="7" r="2"/><path d="M18 18c0-2.2-1.3-4-3-4.6"/></svg>`,
  audit: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="M6 6h8M6 10h5M6 14h7"/></svg>`,
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo Area -->
    <div class="sidebar-brand">
      <img src="/Blicklelogo.png" alt="Blickle" class="brand-logo" />
      <div class="brand-divider"></div>
      <span class="brand-subtitle">Digitales Schwarzes Brett</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <div v-for="(section, si) in navSections" :key="si" class="nav-section">
        <div v-if="si > 0" class="nav-divider"></div>
        <router-link
          v-for="item in section.items"
          :key="item.name"
          :to="item.to"
          :class="['nav-item', { active: isActive(item) }]"
          active-class=""
          exact-active-class=""
        >
          <span class="nav-icon" v-html="icons[item.icon]"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span
            v-if="item.badge && contentStore.inReview.length"
            class="nav-badge"
          >{{ contentStore.inReview.length }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-status">
        <div class="status-dot"></div>
        <span class="status-text">System aktiv</span>
      </div>
      <span class="footer-version">v1.0</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 256px;
  background: linear-gradient(180deg, #0B1F3A 0%, #122E54 40%, #163A6C 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* Subtle noise texture */
.sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(181, 204, 24, 0.04) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.sidebar > * {
  position: relative;
  z-index: 1;
}

/* ── Brand Area ── */
.sidebar-brand {
  padding: 24px 22px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.brand-logo {
  width: 120px;
  height: auto;
  filter: brightness(0) invert(1);
  opacity: 0.95;
  margin-bottom: 12px;
}

.brand-divider {
  height: 1px;
  background: linear-gradient(90deg, rgba(181, 204, 24, 0.3) 0%, rgba(181, 204, 24, 0.05) 100%);
  margin-bottom: 10px;
}

.brand-subtitle {
  font-family: var(--font-body);
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* ── Navigation ── */
.sidebar-nav {
  flex: 1;
  padding: 8px 12px;
  overflow-y: auto;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.07) 70%, transparent 100%);
  margin: 10px 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  letter-spacing: 0.005em;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.9);
}

.nav-item:hover .nav-icon {
  color: var(--blickle-green);
  transform: scale(1.05);
}

.nav-item.active {
  background: rgba(181, 204, 24, 0.1);
  color: var(--blickle-white);
  font-weight: 600;
}

.nav-item.active .nav-icon {
  color: var(--blickle-green);
}

/* Active indicator bar */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: var(--blickle-green);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 12px rgba(181, 204, 24, 0.5);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 180ms ease;
}

.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background: var(--color-danger);
  color: white;
  font-family: var(--font-display);
  font-size: 0.625rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  animation: pulse-badge 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* ── Footer ── */
.sidebar-footer {
  padding: 16px 22px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--blickle-green);
  box-shadow: 0 0 8px rgba(181, 204, 24, 0.6);
  animation: glow-pulse 2.5s ease-in-out infinite;
}

.status-text {
  font-size: 0.6875rem;
  color: rgba(255,255,255,0.35);
  font-weight: 500;
}

.footer-version {
  font-size: 0.625rem;
  color: rgba(255,255,255,0.2);
  font-family: var(--font-mono);
}
</style>
