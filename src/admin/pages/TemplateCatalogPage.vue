<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { getAllTemplates, CATEGORY_LABELS, DESIGNER_TEMPLATES } from '../../shared/templates/registry.js'

const router = useRouter()
const contentStore = useContentStore()
const toast = useToastStore()

const searchQuery = ref('')
const selectedCategory = ref('all')
const view = ref('all') // 'all' | 'designer' | 'legacy'

const allTemplates = computed(() => getAllTemplates())

const categories = computed(() => {
  const cats = new Set()
  allTemplates.value.forEach(t => cats.add(t.category))
  return ['all', ...[...cats].sort()]
})

const filteredTemplates = computed(() => {
  let list = allTemplates.value
  if (view.value === 'designer') list = list.filter(t => t.renderer === 'component')
  else if (view.value === 'legacy') list = list.filter(t => t.renderer === 'html-params')
  if (selectedCategory.value !== 'all') list = list.filter(t => t.category === selectedCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(t => (t.name || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q))
  }
  return list
})

const designerCount = computed(() => allTemplates.value.filter(t => t.renderer === 'component').length)
const legacyCount = computed(() => allTemplates.value.filter(t => t.renderer === 'html-params').length)

function categoryLabel(cat) {
  if (cat === 'all') return 'Alle'
  return CATEGORY_LABELS[cat] || cat
}

function createFromTemplate(tpl) {
  const content = contentStore.createFromTemplate(tpl.id)
  if (!content) { toast.error('Vorlage konnte nicht geladen werden'); return }
  toast.success(`Neuer Entwurf: ${tpl.name}`)
  router.push({ name: 'admin-content-detail', params: { id: content.id } })
}
</script>

<template>
  <div class="catalog-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">Vorlagen-Katalog</h1>
        <p class="page-sub">Waehle eine Vorlage — der Entwurf wird automatisch angelegt und im Editor geoeffnet.</p>
      </div>
      <div class="header-stats">
        <span class="stat"><b>{{ designerCount }}</b> Designer-Vorlagen</span>
        <span class="stat-sep">·</span>
        <span class="stat"><b>{{ legacyCount }}</b> Klassisch</span>
      </div>
    </header>

    <div class="catalog-filters">
      <div class="view-tabs">
        <button :class="['view-tab', { active: view === 'all' }]" @click="view = 'all'">Alle</button>
        <button :class="['view-tab', { active: view === 'designer' }]" @click="view = 'designer'">Designer</button>
        <button :class="['view-tab', { active: view === 'legacy' }]" @click="view = 'legacy'">Klassisch</button>
      </div>
      <div class="filter-row">
        <input v-model="searchQuery" type="search" class="search-input" placeholder="Vorlage suchen..." />
        <div class="category-chips">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['chip', { active: selectedCategory === cat }]"
            @click="selectedCategory = cat"
          >{{ categoryLabel(cat) }}</button>
        </div>
      </div>
    </div>

    <div class="tiles-grid" v-if="filteredTemplates.length">
      <article
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="tile"
        @click="createFromTemplate(tpl)"
      >
        <div
          class="tile-preview"
          :style="{
            background: tpl.thumbnailBg || 'linear-gradient(135deg, #163A6C 0%, #0B1F3A 100%)',
            '--accent': tpl.thumbnailAccent || '#B5CC18',
          }"
        >
          <div class="preview-accent"></div>
          <div class="preview-content">
            <div class="preview-kicker">{{ tpl.defaultParams?.kicker || tpl.category?.toUpperCase() }}</div>
            <div class="preview-title">{{ tpl.defaultParams?.headline || tpl.defaultParams?.jobTitle || tpl.defaultParams?.topic || tpl.defaultParams?.welcome || tpl.name }}</div>
          </div>
          <div class="preview-badge" v-if="tpl.renderer === 'component'">Designer</div>
        </div>
        <div class="tile-body">
          <div class="tile-header-row">
            <h3 class="tile-name">{{ tpl.name }}</h3>
            <span class="tile-category">{{ categoryLabel(tpl.category) }}</span>
          </div>
          <p class="tile-desc">{{ tpl.description || 'Vorlage ohne Beschreibung' }}</p>
          <div class="tile-cta">
            <span class="cta-text">+ Neuer Inhalt</span>
            <span class="cta-arrow">&rarr;</span>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">&#128269;</div>
      <h3>Keine Vorlagen gefunden</h3>
      <p>Andere Kategorie oder anderen Suchbegriff probieren.</p>
    </div>
  </div>
</template>

<style scoped>
.catalog-page { max-width: 1400px; margin: 0 auto; padding: 24px 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-family: var(--font-display); font-size: 1.85rem; font-weight: 700; color: var(--blickle-navy); margin: 0 0 6px; letter-spacing: -0.01em; }
.page-sub { font-size: 0.95rem; color: var(--color-text-secondary); margin: 0; max-width: 620px; }
.header-stats { display: flex; gap: 12px; align-items: center; color: var(--gray-500); font-size: 0.85rem; }
.stat b { color: var(--blickle-navy); font-weight: 700; font-size: 1.05em; }
.stat-sep { opacity: 0.5; }

.catalog-filters { margin-bottom: 24px; display: flex; flex-direction: column; gap: 14px; }
.view-tabs { display: inline-flex; gap: 0; background: var(--gray-100, #F1F5F9); padding: 4px; border-radius: 10px; width: fit-content; }
.view-tab { padding: 8px 20px; background: transparent; border: none; border-radius: 7px; font-size: 0.85rem; font-weight: 600; color: var(--gray-500); cursor: pointer; transition: all 160ms; }
.view-tab.active { background: #fff; color: var(--blickle-navy); box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
.filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
.search-input { padding: 10px 16px; border: 1px solid var(--color-border); border-radius: 10px; font-size: 0.9rem; min-width: 280px; font-family: inherit; background: #fff; }
.search-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 3px rgba(22,58,108,0.08); }
.category-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip { padding: 6px 14px; background: #fff; border: 1px solid var(--color-border); border-radius: 999px; font-size: 0.78rem; font-weight: 500; color: var(--gray-600); cursor: pointer; transition: all 160ms; }
.chip:hover { border-color: var(--blickle-navy); color: var(--blickle-navy); }
.chip.active { background: var(--blickle-navy); border-color: var(--blickle-navy); color: #fff; }

.tiles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.tile { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(11,31,58,0.06); border: 1px solid rgba(11,31,58,0.06); cursor: pointer; transition: all 220ms cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column; }
.tile:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(11,31,58,0.12); border-color: var(--blickle-green); }
.tile-preview { aspect-ratio: 16 / 9; position: relative; padding: 20px 24px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; color: #fff; }
.preview-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--accent); box-shadow: 0 0 16px var(--accent); }
.preview-content { position: relative; z-index: 1; }
.preview-kicker { font-family: var(--font-display); font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; }
.preview-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.preview-badge { position: absolute; top: 12px; right: 12px; background: rgba(181,204,24,0.2); backdrop-filter: blur(8px); border: 1px solid rgba(181,204,24,0.4); color: #fff; padding: 3px 10px; border-radius: 999px; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.tile-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.tile-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.tile-name { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--blickle-navy); margin: 0; }
.tile-category { font-size: 0.65rem; font-weight: 700; color: var(--gray-500); letter-spacing: 0.06em; text-transform: uppercase; background: var(--gray-100, #F1F5F9); padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.tile-desc { font-size: 0.8rem; color: var(--gray-600); line-height: 1.4; margin: 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.tile-cta { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px dashed var(--color-border); margin-top: 4px; font-size: 0.8rem; font-weight: 600; color: var(--blickle-navy); }
.tile:hover .tile-cta { color: var(--blickle-green); }
.cta-arrow { transition: transform 160ms; }
.tile:hover .cta-arrow { transform: translateX(4px); }

.empty-state { text-align: center; padding: 60px 20px; color: var(--gray-500); }
.empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: 0.5; }
.empty-state h3 { font-family: var(--font-display); font-size: 1.2rem; color: var(--blickle-navy); margin-bottom: 6px; }
.empty-state p { font-size: 0.9rem; }
</style>
