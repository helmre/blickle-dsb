<script setup>
import { computed, ref } from 'vue'
import PdfViewer from '../../display/zones/PdfViewer.vue'

const props = defineProps({
  content: { type: Object, required: true },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['replace'])

const pdfDragActive = ref(false)
const pdfError = ref('')
const pdfUploading = ref(false)
const PDF_MAX_BYTES = 8 * 1024 * 1024

const pdfPreviewUrl = computed(() => props.content.fileUrl || '')
const isDataUrl = computed(() => !!props.content.fileUrl?.startsWith?.('data:'))

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDateTime(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Datei konnte nicht gelesen werden'))
    reader.readAsDataURL(file)
  })
}

async function handlePdfFile(file) {
  pdfError.value = ''
  if (props.readonly) return
  if (!file) return
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    pdfError.value = 'Nur PDF-Dateien erlaubt.'
    return
  }
  if (file.size > PDF_MAX_BYTES) {
    pdfError.value = `Datei zu groß (${formatBytes(file.size)}). Maximum: ${formatBytes(PDF_MAX_BYTES)}.`
    return
  }

  pdfUploading.value = true
  try {
    const dataUrl = await readFileAsDataUrl(file)
    emit('replace', { dataUrl, file })
  } catch (error) {
    console.error('[PdfContentEditor] PDF-Upload fehlgeschlagen:', error)
    pdfError.value = 'Upload fehlgeschlagen. Evtl. ist der localStorage voll.'
  } finally {
    pdfUploading.value = false
  }
}

function onPdfFileInput(event) {
  const file = event.target.files?.[0]
  handlePdfFile(file)
  event.target.value = ''
}

function onPdfDrop(event) {
  event.preventDefault()
  pdfDragActive.value = false
  handlePdfFile(event.dataTransfer?.files?.[0])
}

function onPdfDragOver(event) {
  event.preventDefault()
  pdfDragActive.value = true
}

function onPdfDragLeave() {
  pdfDragActive.value = false
}
</script>

<template>
  <div class="pdf-editor">
    <div class="pdf-current">
      <div class="pdf-current-meta">
        <div class="pdf-current-label">Aktuelle Datei</div>
        <div class="pdf-current-name">{{ content.fileName || 'Noch keine Datei' }}</div>
        <div class="pdf-current-sub">
          <span v-if="content.fileSizeBytes">{{ formatBytes(content.fileSizeBytes) }}</span>
          <span v-if="content.updatedAt" class="pdf-dot">·</span>
          <span v-if="content.updatedAt">Zuletzt aktualisiert: {{ formatDateTime(content.updatedAt) }}</span>
          <span v-if="isDataUrl" class="pdf-dot">·</span>
          <span v-if="isDataUrl" class="pdf-badge pdf-badge-upload">Upload</span>
          <span v-if="!isDataUrl && content.fileUrl" class="pdf-dot">·</span>
          <span v-if="!isDataUrl && content.fileUrl" class="pdf-badge pdf-badge-default">Standard-PDF</span>
        </div>
      </div>
    </div>

    <label
      v-if="!readonly"
      :class="['pdf-drop', { 'pdf-drop--active': pdfDragActive, 'pdf-drop--busy': pdfUploading }]"
      @dragover="onPdfDragOver"
      @dragleave="onPdfDragLeave"
      @drop="onPdfDrop"
    >
      <input type="file" accept="application/pdf,.pdf" @change="onPdfFileInput" class="pdf-drop-input" />
      <div class="pdf-drop-icon">&#128196;</div>
      <div class="pdf-drop-title" v-if="!pdfUploading">
        <strong>PDF hier ablegen</strong> oder <span class="pdf-drop-link">Datei auswählen</span>
      </div>
      <div class="pdf-drop-title" v-else>
        <strong>Lädt hoch &hellip;</strong>
      </div>
      <div class="pdf-drop-hint">Nur .pdf · max. 8 MB · ersetzt das aktuelle Dokument sofort</div>
      <div v-if="pdfError" class="pdf-error">{{ pdfError }}</div>
    </label>

    <div class="pdf-preview-wrap" v-if="pdfPreviewUrl">
      <div class="pdf-preview-head">
        <span>Live-Vorschau · wie auf dem Display</span>
      </div>
      <div class="pdf-preview-frame">
        <PdfViewer :pdfUrl="pdfPreviewUrl" :title="content.title" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-editor { display: flex; flex-direction: column; gap: 16px; }
.pdf-current { background: var(--blickle-white); border-radius: 12px; padding: 16px 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.pdf-current-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px; }
.pdf-current-name { font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: var(--blickle-navy); }
.pdf-current-sub { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 0.78rem; color: var(--gray-500); flex-wrap: wrap; }
.pdf-dot { opacity: 0.5; }
.pdf-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase; }
.pdf-badge-upload { background: rgba(181,204,24,0.18); color: #4a5816; }
.pdf-badge-default { background: rgba(148,163,184,0.18); color: #475569; }
.pdf-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 36px 24px; border: 2px dashed var(--color-border); border-radius: 12px; background: var(--blickle-white); cursor: pointer; transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease; position: relative; }
.pdf-drop:hover { border-color: var(--blickle-navy); background: rgba(22,58,108,0.02); }
.pdf-drop--active { border-color: var(--blickle-navy); background: rgba(22,58,108,0.06); transform: scale(1.005); }
.pdf-drop--busy { pointer-events: none; opacity: 0.7; }
.pdf-drop-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.pdf-drop-icon { font-size: 2.2rem; opacity: 0.7; margin-bottom: 4px; }
.pdf-drop-title { font-size: 0.95rem; color: var(--gray-700); }
.pdf-drop-title strong { color: var(--blickle-navy); font-weight: 700; }
.pdf-drop-link { color: var(--blickle-navy); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.pdf-drop-hint { font-size: 0.75rem; color: var(--gray-500); margin-top: 2px; }
.pdf-error { margin-top: 10px; font-size: 0.82rem; color: #b91c1c; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); padding: 6px 12px; border-radius: 6px; }
.pdf-preview-wrap { background: var(--blickle-white); border-radius: 12px; padding: 16px; box-shadow: var(--shadow-sm); }
.pdf-preview-head { margin-bottom: 12px; font-size: 0.7rem; color: var(--gray-500); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }
.pdf-preview-frame { aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #0a0a0a; box-shadow: 0 14px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06); position: relative; }
</style>
