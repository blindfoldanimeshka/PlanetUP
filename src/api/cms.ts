import type { CmsData } from '@/types/cms'
import { siteContent } from '@/data/content'
import { normalizeCmsData } from '@/lib/cmsNormalize'

/**
 * Fetch CMS content. In production, reads from Redis (admin-editable via
 * the /admin panel and Telegram bot). Falls back to static content.ts if
 * the API is unavailable (e.g. local dev without Redis).
 *
 * The result is always normalized over the static defaults so blobs saved
 * by older CMS revisions (missing `features`/`texts`/`mapUrl`) stay usable.
 */
export async function getCmsData(): Promise<CmsData> {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' })
    if (res.ok) {
      const raw: unknown = await res.json()
      return normalizeCmsData(raw)
    }
  } catch {
    // Fall through to static
  }
  return siteContent
}
