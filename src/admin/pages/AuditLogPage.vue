<script setup>
import { ref, computed } from 'vue'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'

const auditStore = useAuditStore()
const userStore = useUserStore()

const searchQuery = ref('')
const filterEntityType = ref('all')
const sortDirection = ref('desc')

const entityTypes = computed(() => {
  const types = new Set()
  auditStore.items.forEach(e => types.add(e.entityType))
  return [...types].sort()
})

const filteredEntries = computed(() => {
  let entries = [...auditStore.items]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    entries = entries.filter(e =>
      e.action.toLowerCase().includes(q) ||
      (e.entityType && e.entityType.toLowerCase().includes(q))
    )
  }

  if (filterEntityType.value !== 'all') {
    entries = entries.filter(e => e.entityType === filterEntityType.value)
  }

  entries.sort((a, b) => {
    const cmp = a.timestamp.localeCompare(b.timestamp)
    return sortDirection.value === 'desc' ? -cmp : cmp
  })

  return entries
})

function getUserName(userId) {
  const u = userStore.getById(userId)
  return u ? u.name : userId || 'System'
}

function formatDetails(details) {
  if (!details || Object.keys(details).length === 0) return '-'
  return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function toggleSort() {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc'
}

const entityTypeLabels = {
  content: 'Inhalt',
  playlist: 'Playlist',
  schedule: 'Zeitplan',
  emergency: 'Notfall',
  location: 'Standort',
  layout: 'Layout',
  user: 'Benutzer',
  template: 'Template'
}
</script>

<template>
  <div class="audit-page">
    <div class="page-toolbar">
      <h2 class="page-title">Audit-Protokoll</h2>
      <span class="entry-count">{{ filteredEntries.length }} Einträge</span>
    </div>

    <div class="filter-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Nach Aktion suchen..."
        class="search-input"
      />
      <select v-model="filterEntityType" class="filter-select">
        <option value="all">Alle Typen</option>
        <option v-for="type in entityTypes" :key="type" :value="type">
          {{ entityTypeLabels[type] || type }}
        </option>
      </select>
    </div>

    <div class="table-card">
      <table class="audit-table">
        <thead>
          <tr>
            <th class="sortable" @click="toggleSort">
              Zeitstempel {{ sortDirection === 'desc' ? '&darr;' : '&uarr;' }}
            </th>
            <th>Aktion</th>
            <th>Entitätstyp</th>
            <th>Benutzer</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in filteredEntries" :key="entry.id">
            <td class="timestamp-cell">{{ new Date(entry.timestamp).toLocaleString('de-DE') }}</td>
            <td>
              <span class="action-badge">{{ entry.action }}</span>
            </td>
            <td>
              <span class="entity-badge">{{ entityTypeLabels[entry.entityType] || entry.entityType }}</span>
            </td>
            <td>{{ getUserName(entry.userId) }}</td>
            <td class="details-cell">{{ formatDetails(entry.details) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filteredEntries.length" class="empty-text">Keine Einträge gefunden.</p>
    </div>
  </div>
</template>

<style scoped>
.audit-page { max-width: 1200px; }

.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 700;
  color: var(--blickle-navy);
}
.entry-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  max-width: 320px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.search-input:focus {
  outline: none;
  border-color: var(--blickle-navy);
  box-shadow: 0 0 0 2px rgba(22, 58, 108, 0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  background: var(--blickle-white);
}

.table-card {
  background: var(--blickle-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}
.audit-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  background: var(--gray-50);
  border-bottom: 1px solid var(--color-border);
}
.audit-table th.sortable {
  cursor: pointer;
  user-select: none;
}
.audit-table th.sortable:hover { color: var(--blickle-navy); }
.audit-table td {
  padding: 10px 16px;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--gray-100);
}

.timestamp-cell {
  white-space: nowrap;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.action-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--blickle-navy);
  color: white;
  font-family: monospace;
}

.entity-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--gray-100);
  color: var(--gray-600);
}

.details-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.empty-text {
  text-align: center;
  color: var(--color-text-secondary);
  padding: 40px;
  font-size: var(--font-size-sm);
}
</style>
