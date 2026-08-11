import type { CmsData } from '@/types/cms'
import { siteContent } from '@/data/content'

/**
 * Fetch CMS content. In production, reads from Redis (admin-editable via Telegram).
 * Falls back to static content.ts if the API is unavailable (e.g. local dev without Redis).
 */
export async function getCmsData(): Promise<CmsData> {
  try {
    const res = await fetch('/api/content')
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fall through to static
  }
  return siteContent
}
