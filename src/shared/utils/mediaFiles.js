const IMAGE_MAX_BYTES = 2 * 1024 * 1024
const VIDEO_MAX_BYTES = 4 * 1024 * 1024

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Datei konnte nicht gelesen werden'))
    reader.readAsDataURL(file)
  })
}

export async function readDesignerMediaFile(file, { kind = 'image' } = {}) {
  if (!file) return ''

  const maxBytes = kind === 'video' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES
  const expectedPrefix = kind === 'video' ? 'video/' : 'image/'
  if (!file.type?.startsWith(expectedPrefix)) {
    throw new Error(kind === 'video' ? 'Bitte eine Videodatei auswählen.' : 'Bitte eine Bilddatei auswählen.')
  }
  if (file.size > maxBytes) {
    throw new Error(`Datei ist zu groß (${formatBytes(file.size)}). Maximum: ${formatBytes(maxBytes)}.`)
  }

  return readFileAsDataUrl(file)
}
