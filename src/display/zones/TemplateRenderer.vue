<script setup>
import { computed } from 'vue'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useTemplateStore } from '../../shared/stores/templateStore.js'
import { getDesignerTemplate, getDisplayAlias } from '../../shared/templates/registry.js'
import { editorRegistry } from '../../shared/templates/editorRegistry.js'
import { renderTemplateHtml } from '../../shared/utils/templateHtml.js'
import { sanitizeEmbedHtml, sanitizeTemplateCss } from '../../shared/utils/sanitizeHtml.js'

const props = defineProps({
  title: { type: String, default: '' },
  zoneId: { type: String, default: '' },
  contentId: { type: String, default: null },
  contentIndex: { type: Number, default: null },
  contentData: { type: Object, default: null },
})

const contentStore = useContentStore()
const templateStore = useTemplateStore()

const content = computed(() => {
  if (props.contentData) return props.contentData
  return props.contentId ? contentStore.getById(props.contentId) : null
})

// Unified template lookup: designer registry first, then legacy templateStore
const template = computed(() => {
  if (!content.value?.templateId) return null
  const designer = getDesignerTemplate(content.value.templateId)
  if (designer) return designer
  return templateStore.items.find(t => t.id === content.value.templateId) || null
})

// Legacy → Designer alias: if a classic template has a visual Designer pendant,
// use that for display rendering with mapped params. Edit flow stays classic.
const displayAlias = computed(() => {
  if (!content.value?.templateId) return null
  return getDisplayAlias(content.value.templateId, content.value.templateParams || {})
})

// Designer component for renderer === 'component' OR for aliased legacy templates
const designerComponent = computed(() => {
  if (displayAlias.value) {
    return editorRegistry[displayAlias.value.displayComponent] || null
  }
  if (!template.value || template.value.renderer !== 'component') return null
  return editorRegistry[template.value.displayComponent || template.value.editorComponent] || null
})

// Params to pass to the Designer component — aliased params take precedence
const designerParams = computed(() => {
  if (displayAlias.value) return displayAlias.value.mappedParams
  return content.value?.templateParams || {}
})

const renderedHtml = computed(() => {
  return renderTemplateHtml(template.value, content.value?.templateParams || {})
})

const templateCss = computed(() => sanitizeTemplateCss(template.value?.cssTemplate || ''))

// For image/video content without templates
const isImage = computed(() => content.value?.type === 'image' && content.value?.fileUrl)
const isVideo = computed(() => content.value?.type === 'video' && content.value?.fileUrl)
const isEmbed = computed(() => content.value?.type === 'html' && content.value?.metadata?.embedCode)
const embedHtml = computed(() => sanitizeEmbedHtml(content.value?.metadata?.embedCode || ''))
</script>

<template>
  <div class="zone-template-renderer">
    <!-- Component-based designer template (native or legacy alias) -->
    <component
      v-if="designerComponent && content"
      :is="designerComponent"
      :params="designerParams"
      :displayMode="true"
      :readonly="true"
    />

    <!-- Legacy HTML+CSS template -->
    <div v-else-if="renderedHtml" class="template-wrap">
      <component :is="'style'" v-if="templateCss">{{ templateCss }}</component>
      <div v-html="renderedHtml" class="template-content"></div>
    </div>

    <!-- Direct image -->
    <div v-else-if="isImage" class="media-wrap media-image">
      <img :src="content.fileUrl" :alt="content.title" />
      <div class="media-caption" v-if="content.title">
        <span class="media-caption-text">{{ content.title }}</span>
      </div>
    </div>

    <!-- Direct video -->
    <div v-else-if="isVideo" class="media-wrap media-video">
      <video :src="content.fileUrl" autoplay muted loop playsinline></video>
      <div class="media-caption" v-if="content.title">
        <span class="media-caption-text">{{ content.title }}</span>
      </div>
    </div>

    <!-- HTML embed (iframe/YouTube) -->
    <div v-else-if="isEmbed" class="media-wrap media-embed" v-html="embedHtml"></div>

    <!-- Fallback: plain text content card -->
    <div v-else-if="content" class="fallback-card">
      <div class="fallback-accent"></div>
      <h2>{{ content.title }}</h2>
      <p v-if="content.description">{{ content.description }}</p>
    </div>

    <!-- No content -->
    <div v-else class="empty-zone">
      <span class="empty-icon">&#128196;</span>
      <span>Kein Inhalt</span>
    </div>
  </div>
</template>

<style scoped>
.zone-template-renderer {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.template-wrap {
  height: 100%;
  width: 100%;
}

.template-content {
  height: 100%;
  width: 100%;
}

/* Media displays */
.media-wrap {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.media-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-embed {
  width: 100%;
  height: 100%;
}

.media-embed :deep(iframe) {
  width: 100%;
  height: 100%;
  border: none;
}

.media-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: 2rem 1.5rem 1rem;
}

.media-caption-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #E8ECF4;
}

/* Fallback text card */
.fallback-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem 3rem;
  position: relative;
}

.fallback-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--d-accent, #B5CC18);
}

.fallback-card h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--d-text, #E8ECF4);
  margin: 0 0 0.6rem;
}

.fallback-card p {
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
  color: var(--d-text-muted, rgba(232,236,244,0.5));
  line-height: 1.5;
}

/* Empty zone */
.empty-zone {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--d-text-faint, rgba(232,236,244,0.2));
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}
</style>
