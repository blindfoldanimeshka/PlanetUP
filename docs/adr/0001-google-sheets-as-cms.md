# Google Sheets as the Content Management System

The studio admin (non-technical) must edit site content — trainer profiles, prices, schedule, FAQ, gallery — without a developer. We chose a single Google Sheets file with 8 tabs, pulled at build time, with a webhook (Google Apps Script → Vercel Deploy Hook) triggering an automatic rebuild on any edit.

**Considered Options:**
- Headless CMS (Sanity / Contentful) — better editing UX, but paid tier or setup overhead, and one more vendor to learn.
- Local JSON/Markdown in repo — free and dependency-free, but every change needs a developer or GitHub access.
- Google Sheets — free, zero technical skill required, single familiar interface, and auto-rebuild keeps the site static.

**Consequences:**
- Hard coupling to the Google ecosystem (Sheets + Drive for images).
- Every content edit triggers a full site rebuild (~1 min) — acceptable at this content volume.
- No real-time content; changes appear after rebuild, not instantly. Fine for a brochure site.
