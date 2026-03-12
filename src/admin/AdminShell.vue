<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../shared/stores/userStore.js'
import { useContentStore } from '../shared/stores/contentStore.js'
import { useEmergencyStore } from '../shared/stores/emergencyStore.js'
import AdminSidebar from './AdminSidebar.vue'

const route = useRoute()
const userStore = useUserStore()
const contentStore = useContentStore()
const emergencyStore = useEmergencyStore()

const pageTitle = computed(() => {
  const titles = {
    'admin-dashboard': 'Dashboard',
    'admin-content': 'Inhalte',
    'admin-content-detail': 'Inhalt bearbeiten',
    'admin-playlists': 'Playlists',
    'admin-playlist-editor': 'Playlist bearbeiten',
    'admin-schedule': 'Zeitplanung',
    'admin-emergency': 'Notfall',
    'admin-locations': 'Standorte',
    'admin-layouts': 'Layouts',
    'admin-templates': 'Templates',
    'admin-approvals': 'Freigaben',
    'admin-users': 'Benutzer',
    'admin-audit-log': 'Audit-Log',
  }
  return titles[route.name] || 'Dashboard'
})
</script>

<template>
  <div class="admin-shell">
    <AdminSidebar />
    <div class="admin-main">
      <header class="admin-header">
        <h1 class="admin-page-title">{{ pageTitle }}</h1>
        <div class="admin-header-actions">
          <router-link to="/display" class="btn-preview" target="_blank">
            &#9654; Display-Vorschau
          </router-link>
          <div class="admin-user">
            <select
              :value="userStore.currentUserId"
              @change="userStore.switchUser($event.target.value)"
              class="user-select"
            >
              <option v-for="user in userStore.items" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.role }})
              </option>
            </select>
          </div>
        </div>
      </header>
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  background: var(--color-background);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 64px;
  background: var(--blickle-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.admin-page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--blickle-navy);
}

.admin-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-preview {
  padding: 6px 16px;
  background: var(--blickle-green);
  color: var(--blickle-navy);
  font-weight: 600;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.btn-preview:hover {
  background: var(--blickle-green-light);
}

.user-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--blickle-white);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
