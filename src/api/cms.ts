import type { CmsData } from '@/types/cms'
import { siteContent } from '@/data/content'

// Static local CMS source. Google Sheets integration was removed in favor of
// version-controlled content (see docs/adr/ADR-0003-local-cms.md).

export async function getCmsData(): Promise<CmsData> {
  return siteContent
}
