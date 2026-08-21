import { compressImageToWebp } from './imageCompress.js'

/** Shared with src/pages/Admin.tsx — keep in sync if renamed. */
export const ADMIN_CSRF_STORAGE_KEY = 'planetup_admin_csrf'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => {
      const result = String(reader.result)
      // strip the `data:<mime>;base64,` prefix
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.readAsDataURL(blob)
  })
}

/**
 * Compress + upload one admin photo.
 *
 * The image is downscaled/re-encoded in the browser first, then POSTed as
 * base64 JSON to /api/upload (same-origin, session cookie + CSRF header),
 * which stores it in Vercel Blob server-side and returns the public URL.
 */
export async function uploadAdminImage(file: File): Promise<string> {
  const compressed = await compressImageToWebp(file)
  const csrfToken =
    typeof sessionStorage === 'undefined'
      ? ''
      : sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY) ?? ''

  let res: Response
  try {
    res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({
        data: await blobToBase64(compressed),
        type: compressed.type || 'image/webp',
      }),
    })
  } catch {
    throw new Error('Сеть недоступна — не удалось загрузить фото')
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    if (res.status === 401) {
      throw new Error('Сессия истекла — войдите в админку заново')
    }
    throw new Error(body.error ?? `Не удалось загрузить фото (${res.status})`)
  }

  const data = (await res.json()) as { url?: string }
  if (!data.url) {
    throw new Error('Сервер не вернул адрес фотографии')
  }
  return data.url
}
