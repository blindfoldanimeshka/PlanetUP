import { upload } from '@vercel/blob/client'
import { compressImageToWebp } from './imageCompress.js'

/**
 * Compress + upload one admin photo to Vercel Blob.
 *
 * The browser receives a short-lived client token from /api/upload (which
 * enforces the admin session) and PUTs the bytes straight to Blob storage,
 * so files never pass through a 4.5 MB-limited serverless body.
 *
 * Returns the public URL to store in the CMS JSON.
 */
export async function uploadAdminImage(file: File): Promise<string> {
  const compressed = await compressImageToWebp(file)
  const pathname = `cms/${compressed.name}`
  try {
    const blob = await upload(pathname, compressed, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    })
    return blob.url
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (/401|Unauthorized/i.test(message)) {
      throw new Error('Сессия истекла — войдите в админку заново')
    }
    throw new Error(`Не удалось загрузить фото: ${message}`)
  }
}
