<script setup>
import { useRoute } from 'vue-router'
import { useContentStore } from '../shared/stores/contentStore.js'

const route = useRoute()
const contentStore = useContentStore()

const navItems = [
  { label: 'Dashboard', icon: '&#9776;', to: '/admin', name: 'admin-dashboard' },
  { label: 'Inhalte', icon: '&#128196;', to: '/admin/content', name: 'admin-content' },
  { label: 'Playlists', icon: '&#9654;', to: '/admin/playlists', name: 'admin-playlists' },
  { label: 'Zeitplanung', icon: '&#128197;', to: '/admin/schedule', name: 'admin-schedule' },
  { label: 'Notfall', icon: '&#9888;', to: '/admin/emergency', name: 'admin-emergency' },
  { divider: true },
  { label: 'Standorte', icon: '&#127970;', to: '/admin/locations', name: 'admin-locations' },
  { label: 'Layouts', icon: '&#9638;', to: '/admin/layouts', name: 'admin-layouts' },
  { label: 'Templates', icon: '&#128220;', to: '/admin/templates', name: 'admin-templates' },
  { divider: true },
  { label: 'Freigaben', icon: '&#10003;', to: '/admin/approvals', name: 'admin-approvals' },
  { label: 'Benutzer', icon: '&#128100;', to: '/admin/users', name: 'admin-users' },
  { label: 'Audit-Log', icon: '&#128221;', to: '/admin/audit-log', name: 'admin-audit-log' },
]
</script>

<template>
  <aside class="admin-sidebar">
    <div class="sidebar-logo">
      <img src="/Blicklelogo.png" alt="Blickle" class="sidebar-logo-img" />
      <span class="sidebar-app-name">Schwarzes Brett</span>
    </div>
    <nav class="sidebar-nav">
      <template v-for="(item, i) in navItems" :key="i">
        <div v-if="item.divider" class="nav-divider"></div>
        <router-link
          v-else
          :to="item.to"
          active-class=""
          exact-active-class=""
          :class="['nav-item', { active: route.name === item.name || (item.name === 'admin-content' && route.name === 'admin-content-detail') || (item.name === 'admin-playlists' && route.name === 'admin-playlist-editor') }]"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span
            v-if="item.name === 'admin-approvals' && contentStore.inReview.length"
            class="nav-badge"
          >{{ contentStore.inReview.length }}</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 240px;
  background: var(--blickle-navy);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo-img {
  height: 28px;
  width: auto;
  filter: brightness(0) invert(1);
}

.sidebar-app-name {
  font-size: 0.7rem;
  color: var(--blickle-green);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--blickle-white);
}

.nav-item.active {
  background: var(--blickle-green);
  color: var(--blickle-navy);
  font-weight: 600;
}

.nav-icon {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background: var(--color-danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
</style>
