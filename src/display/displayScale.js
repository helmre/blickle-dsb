export function calculateDisplayScale(viewportWidth, viewportHeight, canvasWidth = 1920, canvasHeight = 1080) {
  const widthScale = Number(viewportWidth) / canvasWidth
  const heightScale = Number(viewportHeight) / canvasHeight
  const scale = Math.min(widthScale, heightScale)
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}
