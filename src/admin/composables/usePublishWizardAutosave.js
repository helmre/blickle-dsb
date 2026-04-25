import { computed, onMounted, onUnmounted, ref } from 'vue'
import { loadData, removeData, saveData } from '../../shared/utils/storage.js'

const AUTOSAVE_KEY = 'publishWizardDraft'
const AUTOSAVE_RESUME_KEY = 'dsb_publishWizardResume'
const AUTOSAVE_VERSION = 1

function safeClone(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value ?? fallback))
  } catch {
    return fallback
  }
}

function readSessionFlag(key) {
  try {
    return globalThis.sessionStorage?.getItem(key) || null
  } catch (error) {
    console.warn('[PublishWizard] Session-Storage konnte nicht gelesen werden:', error)
    return null
  }
}

function removeSessionFlag(key) {
  try {
    globalThis.sessionStorage?.removeItem(key)
  } catch (error) {
    console.warn('[PublishWizard] Session-Storage konnte nicht bereinigt werden:', error)
  }
}

function writeSessionFlag(key, value) {
  try {
    globalThis.sessionStorage?.setItem(key, value)
    return true
  } catch (error) {
    console.warn('[PublishWizard] Session-Storage konnte nicht geschrieben werden:', error)
    return false
  }
}

export function usePublishWizardAutosave({
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
}) {
  const savedWizardDraft = ref(null)
  const restoringAutosave = ref(false)
  const suppressTemplateDefaults = ref(false)

  let autosaveTimer = null

  const autosaveSavedAtLabel = computed(() => {
    if (!savedWizardDraft.value?.savedAt) return ''
    try {
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(savedWizardDraft.value.savedAt))
    } catch {
      return ''
    }
  })

  function wizardSnapshot() {
    return {
      completedSteps: [...completedSteps.value],
      currentStep: currentStep.value,
      draft: {
        ...draft.value,
        locationIds: [...draft.value.locationIds],
      },
      previewLocationId: previewLocationId.value,
      previewCheckedAt: previewCheckedAt.value,
      previewOpened: previewOpened.value,
      reviewNote: reviewNote.value,
      savedAt: new Date().toISOString(),
      searchQuery: searchQuery.value,
      selectedCategory: selectedCategory.value,
      selectedTemplateId: selectedTemplateId.value,
      targetMode: targetMode.value,
      templateParams: safeClone(templateParams.value, {}),
      version: AUTOSAVE_VERSION,
    }
  }

  function scheduleAutosave() {
    if (restoringAutosave.value) return
    if (autosaveTimer) window.clearTimeout(autosaveTimer)
    autosaveTimer = window.setTimeout(persistAutosave, 350)
  }

  function persistAutosave() {
    autosaveTimer = null
    if (!hasWizardWork.value) {
      removeData(AUTOSAVE_KEY)
      return
    }
    try {
      saveData(AUTOSAVE_KEY, wizardSnapshot())
    } catch (error) {
      console.warn('[PublishWizard] Autosave fehlgeschlagen:', error)
    }
  }

  function flushAutosave() {
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
    persistAutosave()
  }

  function loadAutosave() {
    const saved = loadData(AUTOSAVE_KEY, null)
    if (!saved || saved.version !== AUTOSAVE_VERSION || !saved.selectedTemplateId) return
    if (readSessionFlag(AUTOSAVE_RESUME_KEY) === '1') {
      removeSessionFlag(AUTOSAVE_RESUME_KEY)
      savedWizardDraft.value = saved
      restoreAutosave()
      return
    }
    savedWizardDraft.value = saved
  }

  function restoreAutosave() {
    const saved = savedWizardDraft.value
    if (!saved) return

    restoringAutosave.value = true
    suppressTemplateDefaults.value = true
    selectedTemplateId.value = saved.selectedTemplateId || ''
    selectedCategory.value = saved.selectedCategory || 'all'
    searchQuery.value = saved.searchQuery || ''
    templateParams.value = safeClone(saved.templateParams, {})
    targetMode.value = saved.targetMode === 'specific' ? 'specific' : 'all'
    draft.value = {
      title: saved.draft?.title || '',
      description: saved.draft?.description || '',
      tags: saved.draft?.tags || '',
      validFrom: saved.draft?.validFrom || '',
      validUntil: saved.draft?.validUntil || '',
      locationIds: Array.isArray(saved.draft?.locationIds) ? [...saved.draft.locationIds] : [],
    }
    previewLocationId.value = saved.previewLocationId || ''
    previewCheckedAt.value = saved.previewCheckedAt || ''
    previewOpened.value = Boolean(saved.previewOpened)
    reviewNote.value = saved.reviewNote || ''
    completedSteps.value = Array.isArray(saved.completedSteps)
      ? saved.completedSteps.filter(stepId => steps.some(step => step.id === stepId))
      : []
    currentStep.value = Math.min(Math.max(Number(saved.currentStep) || 0, 0), steps.length - 1)
    savedWizardDraft.value = null

    window.setTimeout(() => {
      restoringAutosave.value = false
      suppressTemplateDefaults.value = false
      persistAutosave()
    }, 0)
    toast.info('Zwischenstand wurde wiederhergestellt')
  }

  function discardAutosave() {
    removeData(AUTOSAVE_KEY)
    savedWizardDraft.value = null
    toast.info('Zwischenstand wurde verworfen')
  }

  function clearAutosave() {
    if (autosaveTimer) {
      window.clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
    removeData(AUTOSAVE_KEY)
    savedWizardDraft.value = null
  }

  function markResumeOnPreviewFallback() {
    writeSessionFlag(AUTOSAVE_RESUME_KEY, '1')
  }

  onMounted(loadAutosave)

  onUnmounted(() => {
    if (autosaveTimer) window.clearTimeout(autosaveTimer)
  })

  return {
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
  }
}
