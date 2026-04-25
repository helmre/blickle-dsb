import { useToastStore } from '../../shared/stores/toastStore.js'
import { readDesignerMediaFile } from '../../shared/utils/mediaFiles.js'

export function useDesignerMediaUpload() {
  const toastStore = useToastStore()

  async function pickDesignerMedia(event, { kind = 'image', onLoaded, errorMessage } = {}) {
    const input = event?.target
    const file = input?.files?.[0]
    if (!file) return null

    try {
      const dataUrl = await readDesignerMediaFile(file, { kind })
      onLoaded?.(dataUrl, file)
      return dataUrl
    } catch (error) {
      toastStore.error(error?.message || errorMessage || 'Datei konnte nicht geladen werden.')
      return null
    } finally {
      if (input) input.value = ''
    }
  }

  return { pickDesignerMedia }
}
