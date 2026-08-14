# Security review — PlanetUP

Date: 2026-08-14  
Scope: React/Vite client, Vercel TypeScript functions, Telegram webhook, Redis-backed CMS and submissions. The review included code/configuration inspection and `npm audit --omit=dev`; no production attack was attempted and no secrets were read.

## Executive summary

The public admin panel is not an authentication boundary: its server credential is deliberately shipped to every browser. This exposes the CMS and all stored booking submissions (including children's details and health-related answers). Independently, the Telegram webhook accepts forged updates because it does not authenticate Telegram as the sender. These two findings should be addressed before production use.

## Critical

### SEC-001 — Server admin credential is published in the browser bundle

- **Location:** `src/pages/Admin.tsx:14, 890, 1033-1036`; `api/content.ts:6-9, 29-35`; `api/submissions.ts:4, 8-15`.
- **Evidence:** the client reads `VITE_ADMIN_PASSWORD` and sends it as `x-admin-token`. Both server routes use the matching `ADMIN_API_TOKEN` as their sole authorization test. Vite exposes `VITE_*` values to client code.
- **Impact:** anyone can download the public JavaScript, extract the token, then read/delete all submissions or replace the CMS. Submissions include contact details and may contain child and injury information.
- **Fix:** replace the shared client secret with server-side authentication and an HttpOnly, Secure production session cookie. Validate credentials only in a server endpoint; keep its verifier/secret exclusively in Vercel environment variables. Authorize `/api/content` writes and `/api/submissions` operations from that session, and add CSRF protection for those cookie-authenticated mutations.
- **Immediate mitigation:** remove the `/admin` deployment or restrict it at the hosting/authentication layer until this change is live. Rotate `ADMIN_API_TOKEN` after migration.

### SEC-002 — Fail-open default admin token

- **Location:** `api/content.ts:9`; `api/submissions.ts:4`; `.env.example:12-16`.
- **Evidence:** both privileged handlers fall back to a known literal when `ADMIN_API_TOKEN` is absent.
- **Impact:** a production deployment missing one environment variable is remotely accessible with a predictable credential.
- **Fix:** fail closed during module initialization/request handling: if the required secret is absent or fails a minimum-strength check, log a configuration error and return `503`; never provide a fallback. Remove real-looking defaults from examples.

### SEC-003 — Telegram webhook requests are not authenticated

- **Location:** `api/tg/webhook.ts:48-59, 63-121`.
- **Evidence:** POST is the only request check; there is no verification of Telegram's `X-Telegram-Bot-Api-Secret-Token` header before the supplied chat ID is trusted.
- **Impact:** an attacker who knows or guesses an authorized chat ID can forge Telegram updates and perform the bot's CMS mutations. They can also cause the bot to message arbitrary supplied chat IDs in the unauthorized-message branch.
- **Fix:** generate a high-entropy `TELEGRAM_WEBHOOK_SECRET`, configure it as Telegram's `secret_token` when setting the webhook, and use timing-safe comparison to reject requests with a missing/incorrect header before parsing the update. Rotate the secret and webhook after deployment.

## High

### SEC-004 — Rate limit does not work reliably on serverless instances

- **Location:** `api/submit-form.ts:11-16, 262-278`.
- **Evidence:** the one-request-per-minute decision is kept in an in-memory `Map`; cold starts and parallel Vercel instances each start with an empty map. The code itself marks the production replacement as TODO.
- **Impact:** automated callers can bypass the intended limit, generate Telegram/email notifications, grow the submissions store, and raise operating cost.
- **Fix:** use an atomic, shared limiter (for example Upstash Redis `INCR` + expiry or its rate-limit product) keyed by a trusted platform-derived client identity. Add a global/route-level limit as well as per-client limiting. Treat the forwarded-IP contract as a deployment assumption and verify it with Vercel.

## Medium

### SEC-005 — No HTTP security-header policy is visible in deployment configuration

- **Location:** `vercel.json:1-5`; `index.html:35-37`.
- **Evidence:** Vercel config only declares an SPA rewrite. No CSP, clickjacking protection, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` is configured. The page loads Yandex Metrika, so any CSP must explicitly permit its required origins.
- **Impact:** weaker browser containment if a future XSS, third-party compromise, or framing attack occurs.
- **Fix:** add response headers in Vercel configuration, first testing a restrictive CSP compatible with the app and Metrika. At minimum set `frame-ancestors 'none'` (if framing is not required), `X-Content-Type-Options: nosniff`, a strict referrer policy, and a narrow permissions policy. Verify final headers on the deployed domain.

### SEC-006 — Production dependency advisories need an update

- **Location:** `package.json:18-33`; lockfile.
- **Evidence:** `npm audit --omit=dev --json` reports three high-severity package records: `fast-uri` (GHSA-7p8r-x3mc-p8w7) and `react-router` / `react-router-dom` (GHSA-qwww-vcr4-c8h2). The React Router advisory describes RSC-mode actions; this SPA does not appear to use RSC, so exploitability is not established, but the patched version should still be adopted.
- **Fix:** update the affected dependency graph with a lockfile review, then run the test suite and production build. Re-run the audit and record the result.

## Positive observations

- Booking input is validated with Zod before notifications and persistence (`api/submit-form.ts:280-290`).
- User-provided booking values are escaped for email and Telegram HTML (`api/submit-form.ts:42-97` and `formatEmailHtml`).
- No `dangerouslySetInnerHTML`, `eval`, or similar DOM injection sink was found in the scanned application code.
- `.env.local` is ignored by Git.

## Recommended order

1. Disable/restrict the public admin route and rotate exposed admin credentials.
2. Replace browser-held authorization with real server-side session authentication.
3. Authenticate Telegram webhook delivery.
4. Move rate limiting to shared atomic storage and add request limits.
5. Add headers and update dependencies.

## Verification still required outside the repository

- Confirm Vercel production environment variables are configured and have never used the documented fallback.
- Inspect deployed response headers, source maps, Vercel access controls, and webhook configuration.
- Review retention/access policy for booking submissions because they may contain minors' and health-related personal data.
