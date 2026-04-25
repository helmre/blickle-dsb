import { computed, onScopeDispose, ref, watch } from 'vue'
import { PERMISSIONS } from '../../shared/auth/policies.js'
import { editorRegistry } from '../../shared/templates/editorRegistry.js'
import { validateContentForPublication } from '../../shared/templates/templateValidation.js'
import { renderTemplateHtml } from '../../shared/utils/templateHtml.js'

const READONLY_MESSAGE = 'Diese Version ist schreibgeschützt. Bitte eine neue Revision erstellen.'
const NO_EDIT_PERMISSION_MESSAGE = 'Diese Ansicht ist schreibgeschützt. Deine Rolle darf Inhalte prüfen, aber nicht bearbeiten.'

export function useContentEditorDraft({ content, template, contentStore, toast, userStore = null }) {
  const localParams = ref({})

  watch(content, (nextContent) => {
    if (nextContent) localParams.value = { ...(nextContent.templateParams || {}) }
  }, { immediate: true })

  const editorComponent = computed(() => {
    if (!template.value || template.value.renderer !== 'component') return null
    return editorRegistry[template.value.editorComponent] || null
  })

  const validationContent = computed(() => {
    if (!content.value) return null
    return { ...content.value, templateParams: { ...localParams.value } }
  })

  const publicationIssues = computed(() => validateContentForPublication(validationContent.value, template.value))
  const isPublishable = computed(() => publicationIssues.value.length === 0)
  const lacksEditPermission = computed(() => userStore ? !userStore.can(PERMISSIONS.CONTENT_EDIT) : false)
  const isReadOnly = computed(() => {
    if (!content.value) return false
    return contentStore.isLocked(content.value) || lacksEditPermission.value
  })

  const htmlPreview = computed(() => {
    if (!template.value || template.value.renderer !== 'html-params') return ''
    return renderTemplateHtml(template.value, localParams.value || {})
  })

  let persistTimer = null

  function guardWritable() {
    if (!isReadOnly.value) return true
    toast.info(lacksEditPermission.value ? NO_EDIT_PERMISSION_MESSAGE : READONLY_MESSAGE)
    return false
  }

  function onUpdateParams(nextParams) {
    if (!guardWritable()) return
    localParams.value = nextParams
    clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      if (!content.value) return
      try {
        contentStore.update(content.value.id, { templateParams: { ...nextParams } })
      } catch (error) {
        toast.error(error?.message || 'Inhalt konnte nicht aktualisiert werden')
      }
    }, 400)
  }

  function flushPendingParams() {
    clearTimeout(persistTimer)
    if (isReadOnly.value) return content.value
    if (!content.value || !template.value) return content.value
    return contentStore.update(content.value.id, { templateParams: { ...localParams.value } })
  }

  function updateField(key, value) {
    if (!content.value || !guardWritable()) return
    try {
      contentStore.update(content.value.id, { [key]: value })
    } catch (error) {
      toast.error(error?.message || 'Inhalt konnte nicht aktualisiert werden')
    }
  }

  function updateTags(value) {
    const tags = (value || '').split(',').map(tag => tag.trim()).filter(Boolean)
    updateField('tags', tags)
  }

  function toggleLocation(id) {
    if (!content.value) return
    const current = new Set(content.value.locationIds || [])
    if (current.has(id)) current.delete(id)
    else current.add(id)
    updateField('locationIds', [...current])
  }

  function setParam(key, value) {
    onUpdateParams({ ...localParams.value, [key]: value })
  }

  onScopeDispose(() => {
    clearTimeout(persistTimer)
  })

  return {
    editorComponent,
    flushPendingParams,
    htmlPreview,
    isPublishable,
    isReadOnly,
    localParams,
    onUpdateParams,
    publicationIssues,
    setParam,
    toggleLocation,
    updateField,
    updateTags,
  }
}
