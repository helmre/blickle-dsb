<script setup>
import { computed } from 'vue'
import { sanitizeTemplateCss } from '../../shared/utils/sanitizeHtml.js'

const props = defineProps({
  template: { type: Object, required: true },
  html: { type: String, default: '' },
})

const previewCss = computed(() => sanitizeTemplateCss(
  props.template.cssTemplate || '',
  '.legacy-preview-wrap .legacy-content'
))
</script>

<template>
  <div class="legacy-preview-wrap">
    <div class="legacy-header"><span>Live-Vorschau · {{ template.name }}</span></div>
    <div class="legacy-frame">
      <component :is="'style'" v-if="previewCss">{{ previewCss }}</component>
      <div class="legacy-content" v-html="html"></div>
    </div>
  </div>
</template>

<style scoped>
.legacy-preview-wrap { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.legacy-header { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.legacy-frame { aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 14px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06); position: relative; }
.legacy-content { width: 100%; height: 100%; }
</style>
