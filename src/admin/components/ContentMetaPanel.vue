<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: Object, required: true },
  template: { type: Object, default: null },
  locations: { type: Array, default: () => [] },
  localParams: { type: Object, default: () => ({}) },
  validationIssues: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update-field', 'update-tags', 'toggle-location', 'set-param'])

const issueKeys = computed(() => new Set(props.validationIssues.map(issue => issue.key)))
const hasTitleIssue = computed(() => issueKeys.value.has('__title'))
const hasValidityIssue = computed(() => issueKeys.value.has('__validity'))

function hasParamIssue(key) {
  return issueKeys.value.has(key)
}

function paramKey(param) {
  return param.key || param.name
}
</script>

<template>
  <aside :class="['meta-panel', { 'meta-panel--readonly': readonly }]">
    <section class="meta-sec">
      <h3 class="meta-title">Metadaten</h3>
      <label class="fld">
        <span class="fld-label">Titel</span>
        <input
          :value="content.title"
          :class="['fld-input', { invalid: hasTitleIssue }]"
          :disabled="readonly"
          @input="emit('update-field', 'title', $event.target.value)"
          type="text"
        />
      </label>
      <label class="fld">
        <span class="fld-label">Beschreibung</span>
        <textarea :value="content.description" :disabled="readonly" @input="emit('update-field', 'description', $event.target.value)" class="fld-input" rows="2"></textarea>
      </label>
      <label class="fld">
        <span class="fld-label">Tags (Komma-getrennt)</span>
        <input :value="(content.tags || []).join(', ')" :disabled="readonly" @input="emit('update-tags', $event.target.value)" type="text" class="fld-input" />
      </label>
    </section>

    <section class="meta-sec">
      <h3 class="meta-title">Gültigkeit</h3>
      <div class="fld-row">
        <label class="fld">
          <span class="fld-label">Ab</span>
          <input
            :value="content.validFrom"
            :class="['fld-input', { invalid: hasValidityIssue }]"
            :disabled="readonly"
            @input="emit('update-field', 'validFrom', $event.target.value || null)"
            type="date"
          />
        </label>
        <label class="fld">
          <span class="fld-label">Bis</span>
          <input
            :value="content.validUntil"
            :class="['fld-input', { invalid: hasValidityIssue }]"
            :disabled="readonly"
            @input="emit('update-field', 'validUntil', $event.target.value || null)"
            type="date"
          />
        </label>
      </div>
    </section>

    <section class="meta-sec">
      <h3 class="meta-title">Standorte</h3>
      <div class="loc-list">
        <label v-for="loc in locations" :key="loc.id" class="loc-item">
          <input type="checkbox" :checked="(content.locationIds || []).includes(loc.id)" :disabled="readonly" @change="emit('toggle-location', loc.id)" />
          <span>{{ loc.name }}</span>
        </label>
      </div>
    </section>

    <section v-if="template && template.renderer === 'html-params' && template.parameters?.length" class="meta-sec">
      <h3 class="meta-title">Parameter</h3>
      <label v-for="p in template.parameters" :key="paramKey(p)" class="fld">
        <span class="fld-label">
          {{ p.label || paramKey(p) }}
          <small v-if="p.required">Pflicht</small>
        </span>
        <textarea
          v-if="p.type === 'textarea' || p.type === 'code'"
          :value="localParams[paramKey(p)]"
          :disabled="readonly"
          @input="emit('set-param', paramKey(p), $event.target.value)"
          :class="['fld-input', { invalid: hasParamIssue(paramKey(p)) }]"
          rows="3"
        ></textarea>
        <select
          v-else-if="p.type === 'select'"
          :value="localParams[paramKey(p)]"
          :disabled="readonly"
          @change="emit('set-param', paramKey(p), $event.target.value)"
          :class="['fld-input', { invalid: hasParamIssue(paramKey(p)) }]"
        >
          <option v-for="opt in (p.options || [])" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <input
          v-else
          :value="localParams[paramKey(p)]"
          :disabled="readonly"
          @input="emit('set-param', paramKey(p), $event.target.value)"
          :type="p.type === 'date' ? 'date' : 'text'"
          :class="['fld-input', { invalid: hasParamIssue(paramKey(p)) }]"
        />
      </label>
    </section>
  </aside>
</template>

<style scoped>
.meta-panel { background: var(--blickle-white); border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm); max-height: calc(100vh - 140px); overflow-y: auto; position: sticky; top: 20px; }
.meta-panel--readonly { box-shadow: none; border: 1px solid rgba(11,31,58,0.08); background: rgba(255,255,255,0.76); }
.meta-sec { margin-bottom: 22px; padding-bottom: 18px; border-bottom: 1px dashed var(--color-border); }
.meta-sec:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
.meta-title { font-family: var(--font-display); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin: 0 0 10px; }
.fld { display: block; margin-bottom: 12px; }
.fld-label { display: flex; justify-content: space-between; gap: 8px; font-size: 0.72rem; font-weight: 600; color: var(--gray-700); margin-bottom: 4px; }
.fld-label small { color: var(--color-danger); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; }
.fld-input { width: 100%; padding: 7px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.82rem; font-family: inherit; box-sizing: border-box; }
.fld-input:focus { outline: none; border-color: var(--blickle-navy); box-shadow: 0 0 0 3px rgba(22,58,108,0.08); }
.fld-input.invalid { border-color: rgba(220, 38, 38, 0.58); box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08); }
.fld-input:disabled { background: var(--gray-50); color: var(--gray-500); cursor: not-allowed; }
.fld-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.loc-list { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; }
.loc-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--gray-700); cursor: pointer; }
.loc-item:has(input:disabled) { color: var(--gray-500); cursor: not-allowed; }
</style>
