<script setup>
import { computed } from 'vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import TemplateRenderer from './TemplateRenderer.vue'

const props = defineProps({
  title: String,
  zoneId: String,
  contentId: { type: String, default: null },
  contentIndex: { type: Number, default: null },
  contentData: { type: Object, default: null },
})

const contentStore = useContentStore()

function mapTagToCategory(tags) {
  if (!tags || tags.length === 0) return 'Allgemein'
  const tag = tags[0].toLowerCase()
  if (tag.includes('sicherheit')) return 'Sicherheit'
  if (tag.includes('produktion')) return 'Produktion'
  if (tag.includes('event')) return 'Events'
  if (tag.includes('sozial')) return 'Mitarbeiter'
  if (tag.includes('neuheit')) return 'Neuheiten'
  if (tag.includes('allgemein')) return 'Allgemein'
  if (tag.includes('messe')) return 'Messen'
  if (tag.includes('nachhaltig')) return 'Nachhaltigkeit'
  if (tag.includes('organisation')) return 'Organisation'
  return tags[0].charAt(0).toUpperCase() + tags[0].slice(1)
}

const directContent = computed(() => {
  if (props.contentData) return props.contentData
  return props.contentId ? contentStore.getById(props.contentId) : null
})

const item = computed(() => {
  if (directContent.value) {
    return {
      id: directContent.value.id,
      title: directContent.value.title,
      text: directContent.value.description || '',
      datum: new Date(directContent.value.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      kategorie: mapTagToCategory(directContent.value.tags)
    }
  }
  return { title: 'Keine Inhalte', text: 'Erstellen Sie Inhalte im Admin-Bereich.', datum: '', kategorie: 'Allgemein' }
})

// Check if the underlying content has rich data (template, media, embed)
const fullContent = computed(() => {
  if (directContent.value) return directContent.value
  return null
})

const isRichContent = computed(() => {
  const c = fullContent.value
  if (!c) return false
  return !!(c.templateId || c.fileUrl || c.metadata?.embedCode)
})

const categoryColors = {
  'Messen': '#3B82F6',
  'Mitarbeiter': '#B5CC18',
  'Organisation': '#F59E0B',
  'Nachhaltigkeit': '#10B981',
  'Produktion': '#8B5CF6',
  'Sicherheit': '#EF4444',
  'Stellenanzeige': '#EC4899',
  'Neuheiten': '#06B6D4',
  'Events': '#F97316',
  'Allgemein': '#6B7280',
}
</script>

<template>
  <!-- Delegate to TemplateRenderer for rich content (templates, media, embeds) -->
  <TemplateRenderer
    v-if="isRichContent"
    :contentData="fullContent"
    :zoneId="zoneId"
  />

  <!-- Simple text card for plain content -->
  <div v-else class="zone-announcement">
    <div
      class="announcement-badge"
      :style="{ background: categoryColors[item.kategorie] || '#B5CC18' }"
    >{{ item.kategorie }}</div>
    <h2 class="announcement-title">{{ item.title }}</h2>
    <p class="announcement-text">{{ item.text }}</p>
    <div class="announcement-date">{{ item.datum }}</div>
  </div>
</template>

<style scoped>
.zone-announcement {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
  text-align: center;
}

.announcement-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #FFFFFF;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.announcement-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--d-text);
  margin-bottom: 12px;
  line-height: 1.3;
}

.announcement-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.0rem;
  color: var(--d-text-muted);
  line-height: 1.6;
  max-width: 95%;
}

.announcement-date {
  margin-top: auto;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: var(--d-text-faint);
  letter-spacing: 0.03em;
}
</style>
