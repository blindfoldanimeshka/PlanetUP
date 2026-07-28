# PlanetUP — Domain Glossary

## Navigation

**Single-page layout (SPA with anchor links)**  
All 10 content sections live on one scrollable homepage. Header contains anchor links to each section. No separate routed pages for «Взрослым» / «Детям».

## Booking & Notifications

**Trial booking form submission**  
All form submissions go to Telegram bot (primary, instant) + email copy (backup, archive). No Google Sheets integration.

**Single booking flow**  
All CTAs across the site («Записаться», «Купить») lead to the same application form. The form has a pre-filled «interest» field indicating the source (specific group, subscription, or general inquiry). No separate purchase flow — all conversions are lead captures, actual payment happens offline at the studio.

**Schedule display: day tabs**  
Schedule shown as horizontal tabs (Mon–Sun) with class list inside each tab. Mobile-friendly, compact.

## Legal & Compliance

**Personal data consent (RU 152-FZ)**  
Booking form includes a mandatory checkbox: «Согласен на обработку персональных данных». Cannot submit without it. Privacy policy available at `/privacy` (separate route) or modal. No submission without explicit consent.

## Branding

**Logo: text placeholder for now**  
No supplied logo yet. Use styled text «Планета UP» (cosmic glow) as placeholder in header/hero. Replace with real SVG/PNG when client provides it.

**Privacy policy: separate route `/privacy`**  
Full standalone page, not a modal. Indexed by search engines, linked from footer and form consent. Adds one more route but preserves SPA architecture.

## Open Questions (deferred)

- **Domain name** — client registers separately per contract. Use `planeta-up.vercel.app` for staging; bind custom domain at production launch. REMINDER: do not forget to ask client for domain before go-live.

## Visual System (direction only)

**Palette & typography chosen at build time**  
No fixed hex values yet. Direction: deep blue/purple cosmic hero (`#0B1026`-class bg, violet `#7C3AED`-class accent, glow), transitioning to light content sections (`#F8FAFC`-class). Font: clean sans (Inter-class) for body, decorative for hero headings. Finalized during implementation when real content is visible.


## Content Management

**Lightweight CMS: Google Sheets**  
All editable content (trainer profiles, subscription prices, schedule, FAQ, gallery links) is stored in Google Sheets and pulled at build time. No headless CMS. The studio admin edits the spreadsheet directly; site rebuilds automatically on changes.

**MOCK-first content strategy**  
All development proceeds with realistic MOCK data (generated text, placeholder images). Real content from the client replaces MOCK data via Google Sheets when available. This unblocks development immediately and prevents deadline risk from content delays.

## Form Validation & Spam Protection

**Anti-spam: honeypot field + rate limiting**  
Form includes an invisible honeypot field. Submissions with that field filled are rejected. Rate limit: max 1 submission per IP per minute. No CAPTCHA (v2/v3) on initial release.

**Phone input: auto-formatting**  
User types digits only; the field auto-formats to `+7 (XXX) XXX-XX-XX` in real time. Raw storage: 11 digits starting with 7.

## Media Storage

**Image hosting: Google Drive (public links)**  
All images (gallery, trainer photos, hero backgrounds) are stored in a shared Google Drive folder. Public direct links referenced in Google Sheets CMS. No local image files in repo. Free, no additional infrastructure required.

## Infrastructure

**Hosting: Vercel (frontend + serverless functions)**  
Static site + API routes (form handler) deployed on Vercel. Single platform, single deploy pipeline.

## Design

**Self-directed UI design**  
No external Figma mockup dependency. Visual direction: cosmic theme (deep blue/purple hero with starfield, soft glow elements, parallax scroll), smooth gradient transition to light sections below. Tailwind CSS + Framer Motion for animations. If a client-provided design arrives later, adjust colors/spacing accordingly.

## Email Service

**Transactional email: Resend**  
All form submission copies sent via Resend API. Free tier: 3000 emails/day. Vercel-native integration.

## Maps

**Contact map: Yandex Maps iframe**  
Studio address displayed via Yandex Maps embed widget. Lazy-loaded on scroll to avoid blocking initial page load.

## CMS Data Model (Google Sheets)

**Single spreadsheet, 8 sheets (tabs):**

1. **trainers** — name, specialization, bio, photo URL, social links
2. **subscriptions** — name, price, description, conditions, sort order
3. **groups** — name, category (adults/kids), level, schedule, description, photo URL
4. **faq** — question, answer, sort order
5. **testimonials** — name, text, photo URL (optional). Manually curated in CMS, no external API.
6. **life_posts** — title, text, date, cover photo URL, additional photo URLs (album)
7. **gallery** — photo URL, category, sort order. Initial volume: ~30 photos. Lazy-loaded via Intersection Observer.
8. **site_settings** — phone, address, email, social links, hero text, SEO title/description. Social channels shown: VK, Telegram channel, WhatsApp. (No YouTube / TikTok.)

**Auto-rebuild: Google Sheets → Vercel Deploy Hook**  
Google Apps Script triggers Vercel Deploy Hook on any sheet edit. Site rebuilds automatically (~1 min). No manual redeploy required.

## Analytics

**Yandex.Metrika only**  
Site-wide counter for traffic, behavior, and conversion tracking. No Google Analytics.

## SEO

**Enhanced SPA SEO**  
Dynamic meta tags (title, description) per section via React Helmet or similar. Semantic HTML5 landmarks (`<header>`, `<main>`, `<section>`, `<footer>`). `sitemap.xml` with anchor URLs. `robots.txt` allowing all. No SSR / Next.js — remain on Vite.
