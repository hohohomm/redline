# Pre-ship Hardening — Design

**Date**: 2026-04-26
**Status**: Approved
**Scope**: Harden RedLine before first real user push. 15 unpushed commits + unapplied migrations + paused logins. One cohesive hardening pass, one deploy, one post-deploy verification.

---

## Goals

1. No prod crash renders the default Next.js error page.
2. Every critical external dependency (Stripe, Resend, Supabase, env) is probeable from a single endpoint post-deploy.
3. Public and auth'd POST endpoints have abuse ceilings.
4. Legal pages name the operator + ABN in a footer disclosure (ACL compliance).
5. Migrations applied to prod Supabase, logins unpaused, real magic-link signup works end-to-end.

## Non-goals

- External error tracking (Sentry). Deferred.
- Distributed rate limiting (Upstash). Deferred — launch-scale traffic fits in-memory.
- Multi-region redundancy or failover.
- Stripe Connect webhook verification (separate concern).
- Subscription paywall enforcement (week 6 work).

---

## Architecture

Four additive tracks. No new deps, no new infra.

```
Track 1  Static fixes        → legal page ABN footer, migrations doc
Track 2  Error surfaces      → app/error.tsx + app/not-found.tsx
Track 3  Health endpoint     → GET /api/health probes 4 systems
Track 4  Rate limits         → lib/rate-limit.ts + 6 call-site wraps
Track 5  Deploy runbook      → markdown checklist of prod steps
```

---

## Track 1 — Static fixes

### Legal pages — ABN footer

Current state: `app/privacy/page.tsx:7` and `app/terms/page.tsx:7` both say "Phillip Preketes (ABN pending registration)". User prefers not to foreground personal name in body copy.

**Decision**: body of both pages refers to "RedLine" (product) only. Each page gets a single footer disclosure line:

> _RedLine is operated by `<NAME>`, ABN `<ABN>`. Contact: support@redlineinvoices.com_

**Why this placement**: ACL s18 (misleading/deceptive conduct) and Privacy Act APP 1 require transparent identification of the responsible entity. Omitting leaves the pages unenforceable and exposes to claims. Footer-only satisfies the legal requirement with minimum personal prominence.

**Placeholder resolution**: `<NAME>` and `<ABN>` must be filled by user before commit. Spec marks them explicit so implementation pauses for values.

### MIGRATIONS-RUN.md

New markdown at repo root. Lists migrations that are committed but not yet run in prod Supabase:

- `0009_settings_business.sql` — adds business_name/email/abn/default_payment_terms/reminder_tone to user_settings.
- `0010_referrals.sql` — adds referral_code column + ensure_referral_code trigger + my_referral_count() SECURITY DEFINER function.

Format: file path, purpose sentence, copy-paste SQL block, verification query. User pastes into Supabase SQL editor manually (per CLAUDE.md: "Run migrations manually — do not auto-apply").

### Env var audit

Read-only. Grep code for `process.env.*`, diff against `.env.local.example`. Report any drift in the runbook. No code change unless a required var is missing from the example file.

---

## Track 2 — Error surfaces

### `app/not-found.tsx`

Server component. Rendered by Next when no route matches (anywhere in app directory).

Contents: same dark graphite aesthetic as landing. Copy:
- h1: "Lost thread."
- p: "The page you asked for isn't here."
- Link: context-aware — if supabase.auth.getUser() returns a user, link to `/dashboard`; else `/`.

No complex components, inline styles matching existing pages.

### `app/error.tsx`

Client component ("use client" — required by Next for error boundaries). Rendered when a route throws.

Signature: `{ error: Error & { digest?: string }; reset: () => void }`.

Contents:
- h1: "Something broke."
- p: "Redline hit an unexpected error. You can try again."
- Button: calls `reset()`. Styled red to match brand.
- Link: `/dashboard` as fallback.
- In dev, renders `error.digest` for debugging. In prod, never exposes error.message to user.

`console.error(error)` only. No external tracking this pass.

---

## Track 3 — Health endpoint

### `app/api/health/route.ts`

GET handler. No auth. Returns JSON. `Cache-Control: no-store`. `export const dynamic = "force-dynamic"`.

**Response shape**:
```json
{
  "ok": true,
  "checks": {
    "env": { "ok": true, "missing": [] },
    "supabase": { "ok": true, "latencyMs": 42 },
    "stripe": { "ok": true, "latencyMs": 180 },
    "resend": { "ok": true, "latencyMs": 120, "domainCount": 1 }
  },
  "version": "<VERCEL_GIT_COMMIT_SHA or 'dev'>",
  "timestamp": "2026-04-26T00:55:00Z"
}
```

**HTTP status**: 200 if all checks ok. 503 if any check fails.

**Probes** (each wrapped individually, 2000ms timeout, never throws):

1. **env** — check presence (not value) of required vars. List:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   RESEND_API_KEY
   APP_URL
   CRON_SECRET
   ```
   Returns `{ ok, missing: string[] }`. `ok` is true only when missing is empty.

2. **supabase** — service-role client. Execute `select 1` via `.rpc()` or the cheapest `.from(...).select("id").limit(1)`. Measure wall time.

3. **stripe** — `stripe.balance.retrieve()`. Lightest auth'd call, confirms key is live. Measure wall time.

4. **resend** — `fetch("https://api.resend.com/domains", { headers: { Authorization: "Bearer $RESEND_API_KEY" }})`. Parse count of verified domains. Measure wall time.

**Security**: returns zero secrets, zero error messages from downstream APIs (could leak internals). Only booleans + latency + domain count.

**Why unauthenticated**: uptime monitors (UptimeRobot, BetterStack free tier) can't sign in. Exposure risk is low because no sensitive data leaves the endpoint.

---

## Track 4 — Rate limits

### `lib/rate-limit.ts`

Pure utility. Sliding window, in-memory. ~30 lines.

```ts
type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
};

// module-scoped Map<key, timestamps[]>
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult;
export function getClientKey(request: Request): string;
```

**Sliding window logic**: on each check, purge timestamps older than `now - windowMs` from the key's array. If array length >= limit, return ok:false. Else push now, return ok:true. O(limit) per call.

**`getClientKey`**: reads request headers in order — `cf-connecting-ip`, `x-real-ip`, first segment of `x-forwarded-for`, `"unknown"`. Vercel sets `x-forwarded-for`.

**Caveat (documented in file header comment)**: Map resets on function cold start; not shared across instances or regions. Acceptable at launch traffic (tens of users, not thousands). Interface designed so swap to Upstash is a one-file change — callers untouched.

### Applied limits

| Route | Limit | Window | Key |
|---|---|---|---|
| `POST /api/auth/magic-link` | 5 | 10 min | IP |
| `POST /api/contact` | 3 | 10 min | IP |
| `POST /api/invoices` | 30 | 1 hour | user.id |
| `POST /api/invoices/[id]/send` | 20 | 1 hour | user.id |
| `GET /api/export/invoices` | 10 | 1 hour | user.id |
| `GET /api/export/clients` | 10 | 1 hour | user.id |

**Not rate-limited** — `/api/stripe/webhook`, `/api/cron/*`. Both auth by shared secret. Rate limiting them breaks legitimate retries from Stripe or Vercel cron retry logic.

### Response on exceed

```ts
return NextResponse.json(
  { error: "rate_limited", retryAfter: secondsUntilReset },
  { status: 429, headers: { "Retry-After": String(secondsUntilReset) } }
);
```

---

## Track 5 — Deploy + verify runbook

### `RUNBOOK-HARDEN.md`

Ordered checklist at repo root. Each step has a verify command:

1. **Supabase migrations**
   - Paste `supabase/migrations/0009_settings_business.sql` into Supabase SQL editor, run.
   - Verify: `SELECT column_name FROM information_schema.columns WHERE table_name='user_settings' AND column_name IN ('business_name','business_email','abn','default_payment_terms','reminder_tone');` — expect 5 rows.
   - Paste `0010_referrals.sql`, run.
   - Verify: `SELECT proname FROM pg_proc WHERE proname IN ('my_referral_count','ensure_referral_code');` — expect 2 rows.

2. **Deploy**
   - `git push origin main`
   - Wait for Vercel deploy. Open Vercel dashboard, confirm build succeeded.

3. **Post-deploy health**
   - `curl https://redlineinvoices.com/api/health` → expect HTTP 200, JSON `{ok: true}`, all checks true.

4. **Post-deploy smoke (Playwright)**
   - `PLAYWRIGHT_BASE_URL=https://redlineinvoices.com npx playwright test`
   - All 8 public smoke tests + 3 hardening tests pass.

5. **Legal spot check**
   - Visit `/privacy`, `/terms`. Confirm footer disclosure line renders.

6. **Real email round-trip**
   - Sign in (login still paused — use existing auth'd user on the prod DB).
   - Create a test invoice for your own email.
   - Click Send. Email arrives from verified Resend domain within 2 min.

7. **Unpause logins**
   - `vercel env ls` → confirm `LOGIN_PAUSED` present.
   - `vercel env rm LOGIN_PAUSED production` (or set to "false" via dashboard).
   - Redeploy.
   - Hit `/login`, submit email, receive magic link, sign in, reach `/dashboard`.

8. **Post-launch monitor**
   - Add `/api/health` as a monitor on UptimeRobot (free tier, 5-min checks).
   - Threshold: 2 consecutive failures → email you.

---

## Files changed

**New (6)**:
```
app/error.tsx                     ~40 lines
app/not-found.tsx                 ~30 lines
app/api/health/route.ts           ~90 lines
lib/rate-limit.ts                 ~40 lines
RUNBOOK-HARDEN.md
MIGRATIONS-RUN.md
docs/superpowers/specs/2026-04-26-pre-ship-hardening-design.md  (this file)
```

**Modified (8)**:
```
app/privacy/page.tsx                    ABN footer
app/terms/page.tsx                      ABN footer
app/api/auth/magic-link/route.ts        rate limit wrap
app/api/contact/route.ts                rate limit wrap
app/api/invoices/route.ts               rate limit wrap
app/api/invoices/[id]/send/route.ts     rate limit wrap
app/api/export/invoices/route.ts        rate limit wrap
app/api/export/clients/route.ts         rate limit wrap
```

Approx 400 LOC added net.

---

## Testing

**Typecheck**: `npx tsc --noEmit` — all code typechecks.

**Playwright**: existing 8 smoke tests continue to pass. Add `tests/e2e/hardening.spec.ts` with:

1. `/api/health` returns 200, JSON `ok:true`, checks.env.ok:true (fails on any prod env drift).
2. `/definitely-not-a-real-route` renders the not-found page text ("Lost thread").
3. Rate limit triggers: 6 POSTs to `/api/contact` in rapid succession. 6th request returns 429 with `Retry-After` header.

**Manual**: the runbook itself is the manual test plan.

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Health endpoint leaks info | Returns only booleans, latency, domain count. No error messages from downstream. |
| Rate limit memory not shared | Documented in file header. Swap to Upstash is one-file change if abuse shows up. |
| `app/error.tsx` masks real bugs | `console.error` in prod; error.digest shown in dev only. |
| Forgotten ABN placeholder | Spec marks `<NAME>` and `<ABN>` explicit. Implementation plan has a "pause for values" step before commit. |
| Migration re-run idempotency | 0009 uses `IF NOT EXISTS`. 0010 uses `OR REPLACE` for functions. Re-running is safe. |
| Rate limit on magic-link blocks legit user after typo | 5/10min per IP is generous. First signup typically = 1 send. |
| Logins remain paused after push | Runbook step 7 explicit. Verification: sign in with a throwaway email end-to-end. |

---

## Dependencies on user action

1. **ABN number + preferred name string** for legal footer. Blocking commit of `app/privacy` + `app/terms` edits.
2. **Run migrations in Supabase SQL editor** (can't automate per CLAUDE.md).
3. **Resend domain must actually be verified in Resend dashboard** for email round-trip. Health endpoint will flag if it's not.
4. **LOGIN_PAUSED=false on Vercel** (manual toggle).

Implementation plan should sequence work so user-blocking steps are isolated to beginning and end of push, not scattered through middle.
