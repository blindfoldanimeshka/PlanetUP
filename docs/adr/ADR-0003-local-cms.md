# ADR-0003: Local TypeScript CMS Instead of Google Sheets

## Status
Accepted — implemented August 2026.

## Context
The original plan ([ADR-0001](./0001-google-sheets-as-cms.md)) used Google Sheets as a lightweight CMS for non-technical admins. During project hand-off the client provided a complete dump of texts, photos and review screenshots, but no live Google Sheets document was set up. Maintaining a separate Sheets-to-build pipeline would add operational overhead without an active editor, and all content changes were being made by the development team anyway.

## Decision
Replace the Google Sheets CMS with a static, version-controlled content module:

- `src/data/content.ts` is the single source of truth for all site content.
- `src/types/cms.ts` defines the `CmsData` contract shared by the old and new sources.
- `src/api/cms.ts` now returns `siteContent` directly; no runtime fetch or `cms.json`.
- Images live in `public/media/` as optimized WebP files; paths are referenced directly from `content.ts`.
- OCR-processed review screenshots are stored in `raw-assets/ocr-out/reviews-final.json` and copied into `content.ts`.

## Consequences

**Positive:**
- No external CMS credentials, API keys or webhook setup.
- Content changes are tracked in Git, reviewable in PRs and reproducible across environments.
- Build is faster because no network fetch happens at build time.
- Offline builds and local previews work without network access.

**Negative:**
- Non-technical edits require a developer or Git-based workflow.
- Image uploads require running `scripts/optimize-media.mjs` rather than dropping a link into a spreadsheet.

## Migration Notes
- `scripts/fetch-cms.js` and `src/data/mock.ts` were removed.
- `src/components/Hero.tsx` and `src/api/cms.ts` were updated to import `siteContent`.
- `SiteSettings` type gained `phoneHref` to keep the formatted display number and the tel: URI together.
