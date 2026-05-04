<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContentStore } from '../../shared/stores/contentStore.js'
import { useScheduleStore } from '../../shared/stores/scheduleStore.js'
import { useLocationStore } from '../../shared/stores/locationStore.js'
import { useUserStore } from '../../shared/stores/userStore.js'
import { useToastStore } from '../../shared/stores/toastStore.js'
import { useAuditStore } from '../../shared/stores/auditStore.js'
import { getTemplateById } from '../../shared/templates/registry.js'
import ContentMetaPanel from '../components/ContentMetaPanel.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import LegacyTemplatePreview from '../components/LegacyTemplatePreview.vue'
import PdfContentEditor from '../components/PdfContentEditor.vue'
import ReviewTimeline from '../components/ReviewTimeline.vue'
import ContentEditorAlerts from '../components/content-editor/ContentEditorAlerts.vue'
import ContentEditorToolbar from '../components/content-editor/ContentEditorToolbar.vue'
import { useContentEditorDraft } from '../composables/useContentEditorDraft.js'
import { useContentEditorWorkflow } from '../composables/useContentEditorWorkflow.js'

const route = useRoute()
const router = useRouter()
const contentStore = useContentStore()
const scheduleStore = useScheduleStore()
const locationStore = useLocationStore()
const userStore = useUserStore()
const toast = useToastStore()
const auditStore = useAuditStore()
const BUSY_RELEASE_MS = 250

const content = computed(() => contentStore.getById(route.params.id))
const template = computed(() => content.value?.templateId ? getTemplateById(content.value.templateId) : null)

const {
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
} = useContentEditorDraft({ content, template, contentStore, toast, userStore })

const {
  canCreateRevision,
  canDelete,
  canSubmit,
  canUpload,
  cancelDeleteRequest,
  confirmDeleteRequest,
  createRevision,
  deleteConfirmMessage,
  deleteConfirmOpen,
  isDeleting,
  latestRejection,
  lockText,
  lockTitle,
  remove,
  replacePdfFile,
  saveDraft,
  statusLabels,
  submitForReview,
} = useContentEditorWorkflow({
  auditStore,
  content,
  contentStore,
  flushPendingParams,
  router,
  scheduleStore,
  template,
  toast,
  userStore,
})

const isSavingDraft = ref(false)
const isSubmitting = ref(false)

async function runWithBusy(flag, action) {
  if (flag.value) return
  flag.value = true
  try {
    await Promise.resolve(action())
  } finally {
    setTimeout(() => {
      flag.value = false
    }, BUSY_RELEASE_MS)
  }
}

function goBackToCatalog() {
  router.push({ name: 'admin-templates' })
}

function saveCurrentDraft() {
  runWithBusy(isSavingDraft, () => saveDraft(isReadOnly.value))
}

function removeCurrentContent() {
  if (isDeleting.value) return
  remove(isReadOnly.value)
}

function submitCurrentContent() {
  runWithBusy(isSubmitting, submitForReview)
}

function replaceCurrentPdfFile(payload) {
  replacePdfFile(payload, isReadOnly.value)
}
</script>

<template>
  <div class="editor-page" v-if="content">
    <ContentEditorToolbar
      :can-create-revision="canCreateRevision"
      :can-delete="canDelete"
      :can-submit="canSubmit"
      :content="content"
      :is-publishable="isPublishable"
      :is-read-only="isReadOnly"
      :is-deleting="isDeleting"
      :is-saving-draft="isSavingDraft"
      :is-submitting="isSubmitting"
      :status-labels="statusLabels"
      :template="template"
      @back="goBackToCatalog"
      @create-revision="createRevision"
      @remove="removeCurrentContent"
      @save-draft="saveCurrentDraft"
      @submit="submitCurrentContent"
    />

    <ConfirmDialog
      v-model:open="deleteConfirmOpen"
      title="Inhalt löschen"
      :message="deleteConfirmMessage"
      confirm-label="Löschen"
      confirm-variant="danger"
      @confirm="confirmDeleteRequest"
      @cancel="cancelDeleteRequest"
    />

    <ContentEditorAlerts
      :can-create-revision="canCreateRevision"
      :content="content"
      :is-publishable="isPublishable"
      :is-read-only="isReadOnly"
      :latest-rejection="latestRejection"
      :lock-text="lockText"
      :lock-title="lockTitle"
      :publication-issues="publicationIssues"
      @create-revision="createRevision"
    />

    <div class="editor-layout">
      <aside class="editor-side">
        <ContentMetaPanel
          :content="content"
          :template="template"
          :locations="locationStore.displayLocations"
          :localParams="localParams"
          :validationIssues="publicationIssues"
          :readonly="isReadOnly"
          @update-field="updateField"
          @update-tags="updateTags"
          @toggle-location="toggleLocation"
          @set-param="setParam"
        />
        <ReviewTimeline :events="content.reviewEvents || []" />
      </aside>

      <main class="editor-main">
        <PdfContentEditor
          v-if="content.type === 'pdf'"
          :content="content"
          :readonly="isReadOnly || !canUpload"
          @replace="replaceCurrentPdfFile"
        />

        <!-- Component-based designer -->
        <component
          v-else-if="editorComponent"
          :is="editorComponent"
          :params="localParams"
          :readonly="isReadOnly"
          @update:params="onUpdateParams"
        />

        <!-- Legacy html-params preview -->
        <LegacyTemplatePreview
          v-else-if="template && template.renderer === 'html-params'"
          :template="template"
          :html="htmlPreview"
        />

        <div v-else class="no-template">
          <div class="empty-icon">&#128188;</div>
          <h3>Keine Vorlage hinterlegt</h3>
          <p>Dieser Inhalt hat keine Vorlage. Setze eine Vorlage über den <router-link :to="{ name: 'admin-templates' }">Katalog</router-link> oder bearbeite die Datei-Felder im klassischen Editor.</p>
        </div>
      </main>
    </div>
  </div>

  <div v-else class="empty-page">
    <div class="empty-icon">&#128269;</div>
    <h3>Inhalt nicht gefunden</h3>
    <p>Der angeforderte Inhalt existiert nicht oder wurde gelöscht.</p>
    <button class="btn-primary" @click="router.push({ name: 'admin-templates' })">Zum Katalog</button>
  </div>
</template>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.editor-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}

.editor-side {
  display: grid;
  gap: 14px;
  align-items: start;
}

.editor-main {
  min-width: 0;
}

.no-template {
  background: var(--blickle-white);
  border-radius: 12px;
  padding: 60px 30px;
  text-align: center;
  color: var(--gray-500);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-template h3,
.empty-page h3 {
  font-family: var(--font-display);
  color: var(--blickle-navy);
  margin-bottom: 8px;
}

.no-template p {
  font-size: 0.9rem;
  max-width: 480px;
  margin: 0 auto;
}

.no-template a {
  color: var(--blickle-navy);
  font-weight: 600;
}

.empty-page {
  text-align: center;
  padding: 80px 20px;
  color: var(--gray-500);
}

.empty-page p {
  margin-bottom: 20px;
}

.btn-primary {
  min-height: 36px;
  padding: 8px 18px;
  background: var(--blickle-navy);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-primary:hover {
  background: #122E54;
}
</style>
