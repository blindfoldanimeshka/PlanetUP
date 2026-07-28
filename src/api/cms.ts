import type { CmsData } from '@/types/cms'
import { mockCms } from '@/data/mock'

// Data source for the site.
//
// At build time `scripts/fetch-cms.js` may produce `public/cms.json` from
// Google Sheets. If the file exists we serve it; otherwise we fall back to
// MOCK content. Components never change when switching between sources.

export async function getCmsData(): Promise<CmsData> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}cms.json`)
    if (res.ok) {
      return (await res.json()) as CmsData
    }
  } catch {
    // cms.json not available — dev mode or build without Sheets
  }
  return mockCms
}
