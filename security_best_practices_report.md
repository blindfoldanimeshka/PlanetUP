# Security review — PlanetUP

Original review: 2026-08-14
Last updated: 2026-08-14 (post-remediation)
Scope: React/Vite client, Vercel TypeScript functions, Telegram webhook, Redis-backed CMS and submissions.

## Executive summary

All Critical/High findings from the original review are **remediated**. `npm audit` reports
**0 vulnerabilities** (including the previously flagged `fast-uri`, `react-router`/`react-router-dom`,
and the entire build-time `@vercel/node` transitive graph). The public admin panel is now a real
authentication boundary (server-side sessions + CSRF), the Telegram webhook authenticates Telegram as
the sender, and the rate limiter is backed by shared atomic Redis storage.

One **Medium** item remains open: no HTTP security-header policy is configured in `vercel.json`
(SEC-005).

## Remediation status

| ID | Finding | Status |
|----|---------|--------|
| SEC-001 | Admin credential shipped to browser | ✅ Resolved |
| SEC-002 | Fail-open default admin token | ✅ Resolved |
| SEC-003 | Telegram webhook unauthenticated | ✅ Resolved |
| SEC-004 | Rate limit unreliable on serverless | ✅ Resolved |
| SEC-005 | No HTTP security-header policy | ✅ Resolved |
| SEC-006 | Production dependency advisories | ✅ Resolved |

## Resolved findings

### SEC-001 — Admin credential no longer in the browser
- **Before:** client read `VITE_ADMIN_PASSWORD` and sent it as `x-admin-token`; `api/content.ts` /
  `api/submissions.ts` used `ADMIN_API_TOKEN` as the sole check. Vite exposed `VITE_*` to the client.
- **After:** login is a server endpoint (`api/admin/session.ts`) that verifies `ADMIN_PASSWORD`
  against a Vercel env secret and returns an **HttpOnly, Secure, SameSite=Strict** session cookie
  (HMAC-sha256 signed, `ADMIN_SESSION_SECRET`). Mutations on `/api/content` and `/api/submissions`
  require that session **plus** an `x-csrf-token`. The client (`src/pages/Admin.tsx`) holds no password.
- `VITE_ADMIN_PASSWORD` and `ADMIN_API_TOKEN` were removed from code, `.env.example`, and Vercel env.

### SEC-002 — Fail-closed configuration
- Required server secrets are read via `getRequiredEnv`, which throws (→ `503`) when a variable is
  missing or shorter than 16 characters. There is no fallback literal. Real-looking defaults were
  removed from `.env.example`.

### SEC-003 — Telegram webhook authenticated
- `api/tg/webhook.ts` verifies `X-Telegram-Bot-Api-Secret-Token` with a **timing-safe** comparison
  and rejects a missing/incorrect header **before** parsing the update. The secret
  (`TELEGRAM_WEBHOOK_SECRET`) is set both in Vercel env and as Telegram's `secret_token` via
  `scripts/set-webhook.mjs`. Verified live: `401` without the header, `200` with the correct one.

### SEC-004 — Redis-backed atomic rate limit
- `claimSubmissionRateLimit` (Upstash Redis) uses an atomic `SET NX EX` claim keyed by the
  platform-derived client IP. Fail-closed: if Redis is unavailable the request is rejected (`503`).
  The old in-memory `Map` + TODO is gone.

### SEC-006 — Dependencies clean
- `fast-uri` 3.1.4 → 3.1.5; `react-router` / `react-router-dom` 7.18.1 → 7.18.2 (non-forced `npm audit fix`).
- Scoped `overrides` close the `@vercel/node` build-time advisories (`js-yaml`, `minimatch`,
  `smol-toml`, `ajv`, `path-to-regexp`) without downgrading majors. Result: `npm audit` → 0.

## Resolved finding

### SEC-005 — HTTP security-header policy
Added to `vercel.json` (applied to all routes via the `/` source): `Content-Security-Policy`
(`default-src 'self'`; `script-src`/`style-src` allow `https://mc.yandex.ru` + `'unsafe-inline'`
for Yandex Metrika's inline init and framer-motion's inline styles), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive
`Permissions-Policy` (camera/microphone/geolocation/payment/usb/interest-cohort disabled).
`frame-ancestors 'none'` is set in CSP. Trade-off: `'unsafe-inline'` is required because the site is
static (no per-request nonce) and Metrika injects an inline init script; a nonce-based strict-CSP
would need a server-rendered HTML shell. Verified live on the deployed domain.

## Required environment variables (server-only, Vercel)

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | admin login password (≥16 chars) |
| `ADMIN_SESSION_SECRET` | HMAC key for the session cookie (≥16 chars, high entropy) |
| `TELEGRAM_WEBHOOK_SECRET` | `secret_token` for Telegram webhook verification (≥16 chars) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `UPSTASH_REDIS_*` | bot + storage (unchanged) |

None use a `VITE_`/`NEXT_PUBLIC_` prefix, so none reach the browser bundle.

## Verification performed
- Build + typecheck + 90 unit tests green after each change.
- Live smoke test: site loads, public `/api/content` works, honeypot silently drops bots,
  admin login returns session + CSRF and reaches protected routes, webhook rejects/accepts by secret.
- `npm audit` → 0 vulnerabilities.
