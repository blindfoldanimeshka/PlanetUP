import { compressImageToWebp } from './imageCompress.js'

/** Shared with src/pages/Admin.tsx — keep in sync if renamed. */
export const ADMIN_CSRF_STORAGE_KEY = 'planetup_admin_csrf'

/**
 * Compress + upload one admin photo.
 *
 * The image is downscaled/re-encoded in the browser first, then POSTed as raw
 * bytes to /api/upload (same-origin, session cookie + CSRF header), which
 * stores it in Vercel Blob server-side and returns the public URL.
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
        'content-type': compressed.type || 'application/octet-stream',
        'x-csrf-token': csrfToken,
      },
      body: compressed,
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
