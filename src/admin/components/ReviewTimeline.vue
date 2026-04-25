<script setup>
import { computed } from 'vue'
import { CheckCircle2, Clock3, MessageSquare, RotateCcw, Send, XCircle } from 'lucide-vue-next'

const props = defineProps({
  events: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
})

const eventMeta = {
  submitted: { label: 'Zur Prüfung eingereicht', icon: Send, tone: 'warning' },
  approved: { label: 'Freigegeben', icon: CheckCircle2, tone: 'success' },
  rejected: { label: 'Abgelehnt', icon: XCircle, tone: 'danger' },
  revision_started: { label: 'Überarbeitung gestartet', icon: RotateCcw, tone: 'info' },
}

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
})

function metaFor(event) {
  return eventMeta[event.type] || { label: 'Kommentar', icon: MessageSquare, tone: 'info' }
}

function formatDate(value) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}
</script>

<template>
  <section :class="['review-timeline', { compact }]">
    <header class="timeline-head">
      <div>
        <h3>Review-Verlauf</h3>
        <p v-if="!compact">Kommentare, Freigaben und Änderungswünsche bleiben hier nachvollziehbar.</p>
      </div>
      <span class="timeline-count">{{ sortedEvents.length }}</span>
    </header>

    <div v-if="sortedEvents.length" class="timeline-list">
      <article v-for="event in sortedEvents" :key="event.id" :class="['timeline-item', `tone-${metaFor(event).tone}`]">
        <div class="event-icon">
          <component :is="metaFor(event).icon" :size="16" />
        </div>
        <div class="event-body">
          <div class="event-top">
            <strong>{{ metaFor(event).label }}</strong>
            <span>{{ formatDate(event.createdAt) }}</span>
          </div>
          <div class="event-actor">
            {{ event.userName || event.userId || 'Unbekannt' }}
          </div>
          <p v-if="event.comment" class="event-comment">{{ event.comment }}</p>
        </div>
      </article>
    </div>

    <div v-else class="timeline-empty">
      <Clock3 :size="18" />
      <span>Noch keine Review-Aktionen.</span>
    </div>
  </section>
</template>

<style scoped>
.review-timeline {
  background: var(--blickle-white);
  border: 1px solid rgba(11, 31, 58, 0.08);
  border-radius: 8px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.timeline-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.timeline-head h3 {
  margin: 0 0 4px;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--blickle-navy);
}

.timeline-head p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.82rem;
  line-height: 1.4;
}

.timeline-count {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 58, 108, 0.08);
  color: var(--blickle-navy);
  font-weight: 800;
  font-size: 0.78rem;
}

.timeline-list {
  display: grid;
  gap: 10px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
}

.event-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  color: var(--gray-600);
}

.tone-success .event-icon {
  background: rgba(16, 185, 129, 0.14);
  color: var(--color-success);
}

.tone-danger .event-icon {
  background: rgba(239, 68, 68, 0.12);
  color: var(--color-danger);
}

.tone-warning .event-icon {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.tone-info .event-icon {
  background: rgba(22, 58, 108, 0.08);
  color: var(--blickle-navy);
}

.event-body {
  min-width: 0;
}

.event-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.event-top strong {
  color: var(--gray-900);
  font-size: 0.86rem;
}

.event-top span,
.event-actor {
  color: var(--gray-500);
  font-size: 0.72rem;
}

.event-comment {
  margin: 8px 0 0;
  padding: 9px 10px;
  border-radius: 7px;
  background: var(--gray-50);
  color: var(--gray-700);
  font-size: 0.82rem;
  line-height: 1.45;
  white-space: pre-wrap;
}

.timeline-empty {
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-500);
  font-size: 0.82rem;
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  padding: 0 12px;
}

.compact {
  box-shadow: none;
  padding: 12px;
}

.compact .timeline-head p {
  display: none;
}

.compact .timeline-item {
  grid-template-columns: 30px 1fr;
  padding: 8px;
}

.compact .event-icon {
  width: 30px;
  height: 30px;
}
</style>
