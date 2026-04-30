<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const props = defineProps({
  title: { type: String, default: '' },
  zoneId: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  pageRotation: { type: Number, default: 10 },
  paused: { type: Boolean, default: false },
  // 'contain' (default): fit entirely, black bars allowed.
  // 'cover-width': scale to full container width, crop bottom if taller.
  fit: { type: String, default: 'contain' },
})

const canvasRef = ref(null)
const containerRef = ref(null)
const errorState = ref(false)
const pageCount = ref(0)
const currentPage = ref(1)

let pdfDoc = null
let loadingTask = null
let renderTask = null
let rotationTimer = null
let resizeObserver = null
let loadToken = 0

function cancelRenderTask() {
  if (!renderTask) return
  try { renderTask.cancel() } catch (_) {}
  renderTask = null
}

async function releasePdfDocument() {
  cancelRenderTask()
  if (loadingTask) {
    try { loadingTask.destroy?.() } catch (_) {}
    loadingTask = null
  }
  if (pdfDoc) {
    const doc = pdfDoc
    pdfDoc = null
    try { await doc.destroy?.() } catch (_) {}
  }
}

async function loadPdf() {
  const token = ++loadToken
  stopRotation()
  await releasePdfDocument()
  pageCount.value = 0
  currentPage.value = 1

  if (!props.pdfUrl) {
    errorState.value = true
    return
  }
  errorState.value = false
  try {
    const task = pdfjsLib.getDocument(props.pdfUrl)
    loadingTask = task
    const nextPdf = await task.promise
    if (token !== loadToken) {
      try { await nextPdf.destroy?.() } catch (_) {}
      return
    }
    pdfDoc = nextPdf
    loadingTask = null
    pageCount.value = pdfDoc.numPages
    currentPage.value = 1
    await renderPage(currentPage.value)
    startRotation()
  } catch (err) {
    if (token !== loadToken) return
    loadingTask = null
    console.error('[PdfViewer] Konnte PDF nicht laden:', props.pdfUrl, err)
    errorState.value = true
  }
}

async function renderPage(pageNum) {
  if (!pdfDoc || !canvasRef.value || !containerRef.value) return

  cancelRenderTask()

  const page = await pdfDoc.getPage(pageNum)
  const unscaledViewport = page.getViewport({ scale: 1 })

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  if (!containerWidth || !containerHeight) return

  const wScale = containerWidth / unscaledViewport.width
  const hScale = containerHeight / unscaledViewport.height
  const fitScale = props.fit === 'cover-width' ? wScale : Math.min(wScale, hScale)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const renderScale = fitScale * dpr

  const viewport = page.getViewport({ scale: renderScale })
  const canvas = canvasRef.value
  canvas.width = viewport.width
  canvas.height = viewport.height
  canvas.style.width = `${unscaledViewport.width * fitScale}px`
  canvas.style.height = `${unscaledViewport.height * fitScale}px`

  const ctx = canvas.getContext('2d')
  renderTask = page.render({ canvasContext: ctx, viewport })
  try {
    await renderTask.promise
  } catch (err) {
    if (err?.name !== 'RenderingCancelledException') {
      console.error('[PdfViewer] Render-Fehler:', err)
    }
  }
  renderTask = null
}

function startRotation() {
  stopRotation()
  if (pageCount.value <= 1 || props.paused) return
  rotationTimer = setInterval(() => {
    currentPage.value = (currentPage.value % pageCount.value) + 1
    renderPage(currentPage.value)
  }, props.pageRotation * 1000)
}

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = null
  }
}

watch(() => props.pdfUrl, () => {
  loadPdf()
})

watch(() => props.paused, (p) => {
  if (p) stopRotation()
  else startRotation()
})

onMounted(() => {
  loadPdf()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      renderPage(currentPage.value)
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(async () => {
  loadToken++
  stopRotation()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  await releasePdfDocument()
})
</script>

<template>
  <div :class="['zone-pdf-viewer', `zone-pdf-viewer--${fit}`]" ref="containerRef">
    <canvas
      v-show="!errorState"
      ref="canvasRef"
      class="pdf-canvas"
    ></canvas>

    <div v-if="errorState" class="pdf-fallback">
      <span class="pdf-fallback-icon">&#128196;</span>
      <span>PDF nicht verfügbar</span>
    </div>

    <div v-if="title" class="pdf-overlay">
      <span class="pdf-title">{{ title }}</span>
      <span v-if="pageCount > 1" class="pdf-page-indicator">
        {{ currentPage }} / {{ pageCount }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.zone-pdf-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f4f5f3;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* cover-width: fill full width, anchor to top so bottom crops gracefully */
.zone-pdf-viewer--cover-width {
  align-items: flex-start;
}

.pdf-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  background: #fff;
  box-shadow: 0 16px 44px rgba(22, 58, 108, 0.12);
}

.zone-pdf-viewer--cover-width .pdf-canvas {
  max-height: none;
}

.pdf-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 3rem 2rem 1.5rem;
  pointer-events: none;
}

.pdf-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #E8ECF4;
  letter-spacing: 0.02em;
}

.pdf-page-indicator {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(232, 236, 244, 0.7);
  background: rgba(0, 0, 0, 0.4);
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.pdf-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(232, 236, 244, 0.3);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
}

.pdf-fallback-icon {
  font-size: 3rem;
  opacity: 0.5;
}
</style>
