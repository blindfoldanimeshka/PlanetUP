import type { CmsData, SiteSettings, SiteTexts } from '../types/cms.js'
import { siteContent } from '../data/content.js'

/**
 * Fill missing CMS fields with the static defaults.
 *
 * Redis blobs created before a given CMS revision lack the newer keys
 * (`features`, `texts`, `settings.mapUrl`, …). Merging over the defaults:
 *  - lets every consumer read a complete `CmsData` without optional chaining;
 *  - keeps Zod's strict `cmsDataSchema` happy when the admin saves an older
 *    blob back (the save itself migrates the stored data);
 *  - preserves existing keys as-is — including deliberately emptied arrays,
 *    so hiding a section by deleting its items keeps working.
 */
export function normalizeCmsData(stored: unknown): CmsData {
  const raw = (stored ?? {}) as Partial<CmsData>
  const settings: Partial<SiteSettings> = raw.settings ?? {}
  const texts: Partial<SiteTexts> = raw.texts ?? {}

  return {
    trainers: raw.trainers ?? siteContent.trainers,
    subscriptions: raw.subscriptions ?? siteContent.subscriptions,
    groups: raw.groups ?? siteContent.groups,
    faq: raw.faq ?? siteContent.faq,
    testimonials: raw.testimonials ?? siteContent.testimonials,
    lifePosts: raw.lifePosts ?? siteContent.lifePosts,
    gallery: raw.gallery ?? siteContent.gallery,
    features: raw.features ?? siteContent.features,
    settings: {
      ...siteContent.settings,
      ...settings,
      mapUrl: settings.mapUrl ?? siteContent.settings.mapUrl,
      social: { ...siteContent.settings.social, ...settings.social },
      hero: { ...siteContent.settings.hero, ...settings.hero },
      seo: { ...siteContent.settings.seo, ...settings.seo },
    },
    texts: {
      nav: { ...siteContent.texts.nav, ...texts.nav },
      headings: { ...siteContent.texts.headings, ...texts.headings },
      booking: { ...siteContent.texts.booking, ...texts.booking },
      heroEyebrow: texts.heroEyebrow ?? siteContent.texts.heroEyebrow,
      heroNote: texts.heroNote ?? siteContent.texts.heroNote,
      teamIntro: texts.teamIntro ?? siteContent.texts.teamIntro,
      scheduleEmptyDay: texts.scheduleEmptyDay ?? siteContent.texts.scheduleEmptyDay,
      footerTagline: texts.footerTagline ?? siteContent.texts.footerTagline,
    },
  }
}
