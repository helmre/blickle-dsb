<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  Monitor,
  Send,
} from 'lucide-vue-next'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { CATEGORY_LABELS, getCatalogTemplates } from '../../shared/templates/registry.js'
import { editorRegistry } from '../../shared/templates/editorRegistry.js'
import { validateTemplateParams } from '../../shared/templates/templateValidation.js'
import { renderTemplateHtml } from '../../shared/utils/templateHtml.js'
import { saveDisplayPreview } from '../../shared/utils/displayPreview.js'
import { safeAuditLog } from '../../shared/utils/auditLog.js'
import { usePublishWizardAutosave } from '../composables/usePublishWizardAutosave.js'
import PublishAutosaveBanner from '../components/publish/PublishAutosaveBanner.vue'
import PublishContentStep from '../components/publish/PublishContentStep.vue'
import PublishReviewStep from '../components/publish/PublishReviewStep.vue'
import PublishStepRail from '../components/publish/PublishStepRail.vue'
import PublishSummaryCard from '../components/publish/PublishSummaryCard.vue'
import PublishTargetStep from '../components/publish/PublishTargetStep.vue'
import PublishTemplateStep from '../components/publish/PublishTemplateStep.vue'

const router = useRouter()
const auditStore = useAuditStore()
const contentStore = useContentStore()
const locationStore = useLocationStore()
const scheduleStore = useScheduleStore()
const toast = useToastStore()
const userStore = useUserStore()

const steps = [
  { id: 'template', label: 'Vorlage', icon: FileText },
  { id: 'content', label: 'Inhalt', icon: FileText },
  { id: 'target', label: 'Ziel & Zeit', icon: CalendarDays },
  { id: 'preview', label: 'Vorschau', icon: Monitor },
]

const currentStep = ref(0)
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedTemplateId = ref('')
const templateParams = ref({})
const previewLocationId = ref('')
const targetMode = ref('all')
const saving = ref(false)
const completedSteps = ref([])
const previewOpened = ref(false)
const previewCheckedAt = ref('')
const reviewNote = ref('')

const draft = ref({
  title: '',
  description: '',
  tags: '',
  validFrom: '',
  validUntil: '',
  locationIds: [],
})

const allTemplates = computed(() => getCatalogTemplates())
const selectedTemplate = computed(() => allTemplates.value.find(t => t.id === selectedTemplateId.value) || null)
const isDesignerTemplate = computed(() => selectedTemplate.value?.renderer === 'component')
const editorComponent = computed(() => {
  if (!isDesignerTemplate.value) return null
  const name = selectedTemplate.value.displayComponent || selectedTemplate.value.editorComponent
  return editorRegistry[name] || null
})
const htmlPreview = computed(() => renderTemplateHtml(selectedTemplate.value, templateParams.value))

const categories = computed(() => {
  const cats = new Set(allTemplates.value.map(t => t.category || 'allgemein'))
  return ['all', ...[...cats].sort()]
})

const filteredTemplates = computed(() => {
  let list = allTemplates.value
  if (selectedCategory.value !== 'all') {
    list = list.filter(template => template.category === selectedCategory.value)
  }
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter(template =>
      (template.name || '').toLowerCase().includes(query) ||
      (template.description || '').toLowerCase().includes(query)
    )
  }
  return list
})

const hasDateError = computed(() => {
  if (!draft.value.validFrom || !draft.value.validUntil) return false
  return draft.value.validFrom > draft.value.validUntil
})

const canSubmitForReview = computed(() => userStore.can(PERMISSIONS.CONTENT_SUBMIT))
const selectableLocations = computed(() => locationStore.displayLocations)
const locationLabel = computed(() => {
  if (targetMode.value === 'all') return 'Alle Standorte'
  if (!draft.value.locationIds.length) return 'Noch kein Standort gewählt'
  return draft.value.locationIds
    .map(id => locationStore.getById(id)?.name || id)
    .join(', ')
})

const previewLocationOptions = computed(() => {
  if (targetMode.value === 'all') return selectableLocations.value
  return selectableLocations.value.filter(location => draft.value.locationIds.includes(location.id))
})

const previewLocationLabel = computed(() => {
  if (!previewLocationId.value) return 'Global / ungefiltert'
  return locationStore.getById(previewLocationId.value)?.name || previewLocationId.value
})

const validityLabel = computed(() => {
  if (!draft.value.validFrom && !draft.value.validUntil) return 'Sofort und ohne Ablaufdatum'
  if (draft.value.validFrom && draft.value.validUntil) return `${draft.value.validFrom} bis ${draft.value.validUntil}`
  if (draft.value.validFrom) return `ab ${draft.value.validFrom}`
  return `bis ${draft.value.validUntil}`
})

const createsDisplaySchedule = computed(() => Boolean(draft.value.validFrom && draft.value.validUntil && !hasDateError.value))
const scheduleLabel = computed(() => {
  if (createsDisplaySchedule.value) {
    return `Display-Zeitplan: ${validityLabel.value}${targetMode.value === 'all' ? ' · alle Standorte' : ` · ${locationLabel.value}`}`
  }
  return 'Kein separater Display-Zeitplan. Die Inhalts-Gültigkeit steuert die Sichtbarkeit direkt.'
})

const templateValidationIssues = computed(() => validateTemplateParams(selectedTemplate.value, templateParams.value))
const isTitleMissing = computed(() => !draft.value.title.trim())
const contentValidationIssues = computed(() => {
  const issues = [...templateValidationIssues.value]
  if (isTitleMissing.value) {
    issues.unshift({ key: '__title', label: 'Titel', message: 'Titel ist ein Pflichtfeld.' })
  }
  return issues
})
const missingFieldKeys = computed(() => new Set(templateValidationIssues.value.map(issue => issue.key)))
const isContentValid = computed(() => contentValidationIssues.value.length === 0)
const isTargetValid = computed(() => targetMode.value === 'all' || draft.value.locationIds.length > 0)
const canConfirmTarget = computed(() => isTargetValid.value && !hasDateError.value)

const checklist = computed(() => [
  { label: 'Vorlage gewählt', done: isStepCompleted('template') },
  { label: 'Inhalt geprüft', done: isStepCompleted('content') && isContentValid.value },
  { label: 'Zielgruppe bestätigt', done: isStepCompleted('target') && canConfirmTarget.value },
  { label: 'Zeitraum geprüft', done: isStepCompleted('target') && !hasDateError.value },
  { label: 'Display-Vorschau geprüft', done: previewOpened.value },
])

const finalChecklist = computed(() => [
  { label: 'Vorlage gewählt', done: !!selectedTemplate.value },
  { label: 'Pflichtangaben vollständig', done: isContentValid.value },
  { label: 'Zielgruppe gesetzt', done: isTargetValid.value },
  { label: 'Zeitraum plausibel', done: !hasDateError.value },
  { label: 'Display-Vorschau geöffnet', done: previewOpened.value },
])

const readyForSubmission = computed(() => finalChecklist.value.every(item => item.done))
const canFinishWizard = computed(() => {
  if (canSubmitForReview.value) return readyForSubmission.value
  return !!selectedTemplate.value && isContentValid.value
})

const hasWizardWork = computed(() => {
  const draftHasText = [
    draft.value.title,
    draft.value.description,
    draft.value.tags,
    draft.value.validFrom,
    draft.value.validUntil,
  ].some(value => String(value || '').trim())
  const paramsHaveText = Object.values(templateParams.value || {}).some(value => String(value || '').trim())
  return Boolean(selectedTemplateId.value || draftHasText || paramsHaveText || draft.value.locationIds.length)
})

const previewFingerprint = computed(() => JSON.stringify({
  draft: draft.value,
  previewLocationId: previewLocationId.value,
  selectedTemplateId: selectedTemplateId.value,
  targetMode: targetMode.value,
  templateParams: templateParams.value,
}))

const reviewContext = computed(() => ({
  locationLabel: locationLabel.value,
  previewCheckedAt: previewCheckedAt.value || null,
  previewLocationId: previewLocationId.value || null,
  previewLocationLabel: previewLocationLabel.value,
  scheduleLabel: scheduleLabel.value,
  targetMode: targetMode.value,
  validityLabel: validityLabel.value,
}))

const {
  autosaveSavedAtLabel,
  clearAutosave,
  discardAutosave,
  flushAutosave,
  markResumeOnPreviewFallback,
  restoreAutosave,
  restoringAutosave,
  savedWizardDraft,
  scheduleAutosave,
  suppressTemplateDefaults,
} = usePublishWizardAutosave({
  completedSteps,
  currentStep,
  draft,
  hasWizardWork,
  previewCheckedAt,
  previewLocationId,
  previewOpened,
  reviewNote,
  searchQuery,
  selectedCategory,
  selectedTemplateId,
  steps,
  targetMode,
  templateParams,
  toast,
})

const maxUnlockedStep = computed(() => {
  if (isStepCompleted('target')) return 3
  if (isStepCompleted('content')) return 2
  if (isStepCompleted('template')) return 1
  return 0
})

const canGoNext = computed(() => {
  if (currentStep.value === 0) return !!selectedTemplate.value
  if (currentStep.value === 1) return isContentValid.value
  if (currentStep.value === 2) return canConfirmTarget.value
  return true
})

watch(selectedTemplate, (template) => {
  if (!template) return
  if (suppressTemplateDefaults.value) {
    suppressTemplateDefaults.value = false
    return
  }
  templateParams.value = JSON.parse(JSON.stringify(template.defaultParams || {}))
  draft.value.title = template.name || ''
  draft.value.description = template.description || ''
  draft.value.tags = template.category ? categoryLabel(template.category) : ''
}, { immediate: true })

watch(() => draft.value.locationIds.join('|'), () => {
  if (targetMode.value === 'all') {
    if (previewLocationId.value && !locationStore.getById(previewLocationId.value)) previewLocationId.value = ''
    return
  }
  if (!draft.value.locationIds.includes(previewLocationId.value)) {
    previewLocationId.value = draft.value.locationIds[0] || ''
  }
}, { immediate: true })

watch(targetMode, (mode) => {
  if (mode === 'all') {
    draft.value.locationIds = []
    previewLocationId.value = ''
  } else if (previewLocationId.value && !draft.value.locationIds.includes(previewLocationId.value)) {
    previewLocationId.value = draft.value.locationIds[0] || ''
  }
})

watch(previewFingerprint, () => {
  if (restoringAutosave.value) return
  previewOpened.value = false
  previewCheckedAt.value = ''
})

watch(
  () => ({
    completedSteps: completedSteps.value,
    currentStep: currentStep.value,
    draft: draft.value,
    previewLocationId: previewLocationId.value,
    previewCheckedAt: previewCheckedAt.value,
    previewOpened: previewOpened.value,
    reviewNote: reviewNote.value,
    searchQuery: searchQuery.value,
    selectedCategory: selectedCategory.value,
    selectedTemplateId: selectedTemplateId.value,
    targetMode: targetMode.value,
    templateParams: templateParams.value,
  }),
  scheduleAutosave,
  { deep: true }
)

function categoryLabel(category) {
  if (category === 'all') return 'Alle'
  return CATEGORY_LABELS[category] || category
}

function selectTemplate(template) {
  selectedTemplateId.value = template.id
  completedSteps.value = ['template']
  currentStep.value = 1
}

function nextStep() {
  if (!canGoNext.value) return
  markStepComplete(steps[currentStep.value].id)
  currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
}

function previousStep() {
  currentStep.value = Math.max(currentStep.value - 1, 0)
}

function isStepCompleted(stepId) {
  return completedSteps.value.includes(stepId)
}

function markStepComplete(stepId) {
  if (!stepId || completedSteps.value.includes(stepId)) return
  completedSteps.value = [...completedSteps.value, stepId]
}

function goToStep(index) {
  if (index > maxUnlockedStep.value) return
  currentStep.value = index
}

function toggleLocation(id) {
  if (targetMode.value !== 'specific') targetMode.value = 'specific'
  const ids = new Set(draft.value.locationIds)
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  draft.value.locationIds = [...ids]
}

function setTargetMode(mode) {
  targetMode.value = mode
}

function setDraftField(key, value) {
  draft.value = { ...draft.value, [key]: value }
}

function setParam(key, value) {
  templateParams.value = { ...templateParams.value, [key]: value }
}

function contentPayload() {
  return {
    title: draft.value.title.trim(),
    description: draft.value.description.trim(),
    tags: draft.value.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    templateParams: { ...templateParams.value },
    validFrom: draft.value.validFrom || null,
    validUntil: draft.value.validUntil || null,
    locationIds: targetMode.value === 'all' ? [] : [...draft.value.locationIds],
    createdBy: userStore.currentUser?.id || '',
    reviewContext: { ...reviewContext.value },
    reviewNote: reviewNote.value.trim(),
  }
}

function createContentSchedule(content) {
  if (!createsDisplaySchedule.value) return null
  const schedule = scheduleStore.add({
    targetType: 'content',
    targetId: content.id,
    startDate: draft.value.validFrom,
    endDate: draft.value.validUntil,
    locationIds: targetMode.value === 'all' ? [] : [...draft.value.locationIds],
    recurrence: 'none',
    timeStart: null,
    timeEnd: null,
    weekdays: null,
  })
  safeAuditLog(auditStore, 'schedule.created_from_publish', 'schedule', schedule.id, userStore.currentUser?.id, {
    contentId: content.id,
    title: content.title,
  }, { toast })
  return schedule
}

function displayPreviewPayload() {
  return {
    ...contentPayload(),
    id: `preview-${selectedTemplate.value?.id || 'draft'}`,
    type: 'template',
    templateId: selectedTemplate.value?.id || '',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPreview: true,
  }
}

function displayPreviewHref(token) {
  const locationPart = previewLocationId.value ? `/${encodeURIComponent(previewLocationId.value)}` : ''
  return `#/display${locationPart}?preview=${encodeURIComponent(token)}`
}

function displayPreviewUrl(token) {
  return new URL(displayPreviewHref(token), window.location.href).toString()
}

function openDisplayPreview() {
  if (!selectedTemplate.value || !draft.value.title.trim()) return
  try {
    const token = saveDisplayPreview(displayPreviewPayload())
    const previewWindow = window.open(displayPreviewUrl(token), '_blank', 'noopener,noreferrer')
    previewOpened.value = true
    previewCheckedAt.value = new Date().toISOString()
    flushAutosave()
    if (previewWindow) {
      try {
        previewWindow.opener = null
      } catch {
        // Ignore browser-specific opener restrictions.
      }
    } else {
      markResumeOnPreviewFallback()
      window.location.href = displayPreviewHref(token)
    }
  } catch (error) {
    console.error('[PublishWizard] Display-Vorschau fehlgeschlagen:', error)
    toast.error('Display-Vorschau konnte nicht geöffnet werden')
  }
}

async function saveContent(submitForReview = false) {
  if (!selectedTemplate.value || !draft.value.title.trim() || saving.value) return
  if (submitForReview && canSubmitForReview.value && !readyForSubmission.value) {
    toast.error('Bitte prüfe zuerst alle Punkte der Einreichungs-Checkliste')
    return
  }
  if (!userStore.can(PERMISSIONS.CONTENT_CREATE)) {
    toast.error('Keine Berechtigung zum Erstellen von Inhalten')
    return
  }

  saving.value = true
  try {
	    const content = contentStore.createFromTemplate(selectedTemplate.value.id, contentPayload())
	    if (!content) throw new Error('Vorlage konnte nicht geladen werden')
	    createContentSchedule(content)

    safeAuditLog(auditStore, 'content.created_wizard', 'content', content.id, userStore.currentUser?.id, {
      templateId: selectedTemplate.value.id,
      title: content.title,
    }, { toast })

    if (submitForReview && canSubmitForReview.value) {
      contentStore.submitForReview(content.id, userStore.currentUser, reviewNote.value)
      safeAuditLog(auditStore, 'content.submit', 'content', content.id, userStore.currentUser?.id, {
        reviewNote: reviewNote.value.trim(),
        title: content.title,
      }, { toast })
      clearAutosave()
      toast.success('Inhalt wurde zur Prüfung eingereicht')
      router.push({ name: 'admin-content' })
      return
    }

    clearAutosave()
    toast.success('Entwurf wurde angelegt')
    router.push({ name: 'admin-content-detail', params: { id: content.id } })
  } catch (error) {
    console.error('[PublishWizard] Speichern fehlgeschlagen:', error)
    toast.error(error?.message || 'Inhalt konnte nicht gespeichert werden')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="publish-page">
    <header class="publish-hero">
      <div>
        <p class="eyebrow">Veröffentlichungs-Assistent</p>
        <h1 class="hero-title">Eine Info sauber bis zur Display-Freigabe bringen</h1>
      </div>
      <button class="ghost-link" type="button" @click="router.push({ name: 'admin-content' })">
        <ArrowLeft :size="16" />
        <span>Zurück zur Liste</span>
      </button>
    </header>

    <PublishAutosaveBanner
      v-if="savedWizardDraft"
      :saved-at-label="autosaveSavedAtLabel"
      @discard="discardAutosave"
      @restore="restoreAutosave"
    />

    <div class="wizard-shell">
      <PublishStepRail
        :completed-steps="completedSteps"
        :current-step="currentStep"
        :max-unlocked-step="maxUnlockedStep"
        :steps="steps"
        @go-to-step="goToStep"
      />

      <main class="wizard-main">
        <PublishTemplateStep
          v-if="currentStep === 0"
          v-model:search-query="searchQuery"
          v-model:selected-category="selectedCategory"
          :categories="categories"
          :category-label="categoryLabel"
          :filtered-templates="filteredTemplates"
          :selected-template-id="selectedTemplateId"
          @select-template="selectTemplate"
        />

        <PublishContentStep
          v-else-if="currentStep === 1"
          :content-validation-issues="contentValidationIssues"
          :draft="draft"
          :editor-component="editorComponent"
          :html-preview="htmlPreview"
          :is-content-valid="isContentValid"
          :is-title-missing="isTitleMissing"
          :missing-field-keys="missingFieldKeys"
          :selected-template="selectedTemplate"
          :template-params="templateParams"
          @update-draft-field="setDraftField"
          @update-param="setParam"
          @update:params="templateParams = $event"
        />

        <PublishTargetStep
          v-else-if="currentStep === 2"
          :draft="draft"
          :has-date-error="hasDateError"
          :schedule-label="scheduleLabel"
          :selectable-locations="selectableLocations"
          :target-mode="targetMode"
          :validity-label="validityLabel"
          @set-target-mode="setTargetMode"
          @toggle-location="toggleLocation"
          @update-draft-field="setDraftField"
        />

        <PublishReviewStep
          v-else
          v-model:preview-location-id="previewLocationId"
          v-model:review-note="reviewNote"
          :can-submit-for-review="canSubmitForReview"
          :draft="draft"
          :editor-component="editorComponent"
          :final-checklist="finalChecklist"
          :html-preview="htmlPreview"
          :location-label="locationLabel"
          :preview-location-label="previewLocationLabel"
          :preview-location-options="previewLocationOptions"
          :ready-for-submission="readyForSubmission"
          :schedule-label="scheduleLabel"
          :selected-template="selectedTemplate"
          :target-mode="targetMode"
          :template-params="templateParams"
          :validity-label="validityLabel"
          @open-display-preview="openDisplayPreview"
        />

        <footer class="wizard-actions">
          <button type="button" class="btn-secondary" :disabled="currentStep === 0" @click="previousStep">
            <ArrowLeft :size="16" />
            <span>Zurück</span>
          </button>
          <div class="action-spacer"></div>
          <button type="button" class="btn-secondary" :disabled="saving || !selectedTemplate" @click="saveContent(false)">
            Als Entwurf speichern
          </button>
          <button v-if="currentStep < steps.length - 1" type="button" class="btn-primary" :disabled="!canGoNext" @click="nextStep">
            <span>Weiter</span>
            <ArrowRight :size="16" />
          </button>
          <button v-else type="button" class="btn-primary" :disabled="saving || !canFinishWizard" @click="saveContent(true)">
            <Send :size="16" />
            <span>{{ canSubmitForReview ? 'Zur Prüfung einreichen' : 'Entwurf speichern' }}</span>
          </button>
        </footer>
      </main>

      <PublishSummaryCard
        :checklist="checklist"
        :location-label="locationLabel"
        :template-name="selectedTemplate?.name || ''"
        :validity-label="validityLabel"
      />
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 22px 0 32px;
}

.publish-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 5px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blickle-green);
}

.hero-title {
  margin: 0;
  max-width: 820px;
  font-family: var(--font-display);
  font-size: 1.65rem;
  line-height: 1.12;
  color: var(--blickle-navy);
}

.ghost-link,
.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  border-radius: 8px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
}

.ghost-link {
  border: 1px solid var(--color-border);
  background: var(--blickle-white);
  color: var(--blickle-navy);
  padding: 0 13px;
}

.wizard-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 290px;
  gap: 16px;
  align-items: start;
}

.wizard-main {
  min-width: 0;
}

.wizard-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.action-spacer {
  flex: 1;
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--blickle-navy);
  padding: 0 14px;
}

.btn-primary {
  border: 1px solid var(--blickle-green);
  background: var(--blickle-green);
  color: var(--blickle-navy);
  padding: 0 16px;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 1180px) {
  .wizard-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .publish-hero,
  .wizard-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-spacer {
    display: none;
  }
}
</style>
