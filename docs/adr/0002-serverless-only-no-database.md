# Serverless-only Architecture (No Database)

The technical specification mandates a JAMstack static build with no own server or database. We decided the only backend is a Vercel serverless function that receives booking-form submissions and forwards them to Telegram (primary) and email via Resend (copy). No lead data is stored in our own infrastructure.

**Considered Options:**
- Own database (Postgres / Supabase) — would let us store and query leads, but adds cost, maintenance, and contradicts the static-build constraint.
- Third-party form service (Formspree / Getform) — zero code, but less control over validation, spam rules, and notification routing.
- Serverless function + external notifications — chosen: satisfies the static-build constraint, keeps a single hosting platform, and owns the full submission flow logic.

**Consequences:**
- We do not own submission data; lead history lives only in Telegram chat and email inbox. Acceptable because actual enrollment happens offline at the studio.
- The serverless function is the sole backend surface; all business logic for spam protection (honeypot, rate limit) lives there.
- Past submissions cannot be queried or exported programmatically without adding a store later.
