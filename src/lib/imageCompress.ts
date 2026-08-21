/**
 * Client-side photo compression for CMS uploads.
 *
 * Photos coming straight from a phone are far larger than the site needs.
 * We downscale to MAX_PHOTO_EDGE_PX on the longest edge and re-encode as WebP
 * before anything touches the network, keeping Blob storage small and page
 * loads fast. Falls back to JPEG when the browser can't encode WebP.
 */

export const MAX_PHOTO_EDGE_PX = 1600
export const WEBP_QUALITY = 0.82
/** Hard ceiling on the source file BEFORE compression kicks in. */
export const MAX_SOURCE_FILE_BYTES = 25 * 1024 * 1024

/** Target dimensions after downscaling; never upscales, never rounds to 0. */
export function computeTargetSize(
  width: number,
  height: number,
  maxEdge: number = MAX_PHOTO_EDGE_PX,
): { width: number; height: number } {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error('Некорректные размеры изображения')
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось закодировать изображение'))),
      type,
      quality,
    )
  })
}

/**
 * Downscales and re-encodes an image File. Returns a File ready for upload.
 * If re-encoding would not shrink the source (already tiny/WebP), the original
 * file is returned untouched.
 */
export async function compressImageToWebp(
  file: File,
  maxEdge: number = MAX_PHOTO_EDGE_PX,
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Можно загружать только изображения')
  }
  if (file.size > MAX_SOURCE_FILE_BYTES) {
    throw new Error('Файл слишком большой (максимум 25 МБ)')
  }

  // FileReader -> data: URL instead of URL.createObjectURL: production CSP
  // allows img-src 'self' data: https: but not blob:, so object URLs break
  // image decoding in the admin panel.
  const bitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'))
      img.onload = () => resolve(img)
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })

  const { width, height } = computeTargetSize(bitmap.naturalWidth, bitmap.naturalHeight, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен в этом браузере')
  ctx.drawImage(bitmap, 0, 0, width, height)

  let blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY)
  let ext = 'webp'
  if (blob.type !== 'image/webp') {
    // Browser without WebP encoding silently returns PNG — prefer JPEG instead.
    blob = await canvasToBlob(canvas, 'image/jpeg', WEBP_QUALITY)
    ext = 'jpg'
  }

  if (blob.size >= file.size && file.type === blob.type) {
    // Compression is a no-op here (e.g. already a small WebP) — keep original.
    return file
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${baseName}.${ext}`, { type: blob.type })
}
