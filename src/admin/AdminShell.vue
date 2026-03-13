<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../shared/stores/userStore.js'
import { useContentStore } from '../shared/stores/contentStore.js'
import { useEmergencyStore } from '../shared/stores/emergencyStore.js'
import AdminSidebar from './AdminSidebar.vue'
import AdminToast from './components/AdminToast.vue'

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
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <router-link to="/display" class="btn-preview" target="_blank">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="2" width="14" height="10" rx="1.5"/>
              <path d="M5 14h6M8 12v2"/>
            </svg>
            <span>Display-Vorschau</span>
          </router-link>
          <div class="header-divider"></div>
          <div class="user-area">
            <div class="user-avatar">
              {{ userStore.currentUser?.name?.charAt(0) || 'A' }}
            </div>
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
        <router-view v-slot="{ Component }">
          <transition name="admin-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <AdminToast />
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
  min-width: 0;
}

.admin-header {
  height: 56px;
  background: var(--blickle-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.01em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn-preview {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  background: var(--blickle-green);
  color: var(--blickle-navy);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.75rem;
  border-radius: 8px;
  transition: all 200ms ease;
  letter-spacing: 0.005em;
}

.btn-preview:hover {
  background: var(--blickle-green-light);
  box-shadow: 0 2px 10px rgba(181, 204, 24, 0.3);
  transform: translateY(-1px);
}

.header-divider {
  width: 1px;
  height: 24px;
  background: var(--gray-200);
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--blickle-navy);
  color: white;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.6875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-select {
  padding: 6px 10px;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  background: var(--blickle-white);
  color: var(--gray-600);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 200ms ease;
}

.user-select:hover {
  border-color: var(--gray-300);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

/* Page transitions */
.admin-fade-enter-active,
.admin-fade-leave-active {
  transition: opacity 0.15s ease;
}

.admin-fade-enter-from,
.admin-fade-leave-to {
  opacity: 0;
}
</style>
