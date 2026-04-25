# Morning pickup — start here

Last session ended with rate limit. Two parallel Sonnet 4.6 agents finished:
- Linear Rei tour onboarding + Stripe Connect + Resend domain helper
- 10 HTML mockups in `/mockups/`

## Status snapshot

| Thing | State |
|-------|-------|
| Login pause | ON (`LOGIN_PAUSED=true` set on Vercel prod) |
| Onboarding flow | Built, NOT migrated yet (blocked on step 1 below) |
| Email theming | Done. All transactional emails dark-themed |
| Stripe Connect | Built, NOT live yet (blocked on step 2 below) |
| Mockups | 10 HTMLs reviewable in `/mockups/` |
| Anime mascot in hero | Decision: cut. Clips never wired into prod hero anyway |
| Pricing page | Missing |
| Analytics | Missing |
| Demo mode | Missing |

## You must do (blocking)

### 1. Apply migration 0008 — adds 7 columns to `user_settings`

1. Open Supabase SQL editor
2. Paste full contents of `supabase/migrations/0008_onboarding_extend.sql`
3. Run
4. Verify:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name IN
  ('currency','late_fee_type','late_fee_value','late_fee_after_days',
   'owner_first_name','stripe_charges_enabled','onboarding_preset');
```

Should return 7 rows.

### 2. Stripe Connect webhook (only if going live with pay-link this week)

Skip if deferring Stripe Connect. Otherwise:

1. Stripe Dashboard → Developers → Webhooks → **+ Add endpoint**
2. URL: `https://redlineinvoices.com/api/stripe/connect/webhook`
3. Listen on: **Connected accounts** (NOT your own account)
4. Events: `account.updated`
5. Copy signing secret (`whsec_…`)
6. Run `bash scripts/morning-setup.sh` — handles env + redeploy interactively

### 3. Anime clip cleanup

Currently in repo: `public/assets/redline-clips/01-invoice-tunnel.mp4`, `02-chaos-to-paid.mp4`, `03-operator-control.mp4`.

Verified via grep: **none of these are referenced in code**. Hero uses `public/assets/redline-login-loop.mp4` (abstract red, no anime).

To remove the anime clips:

```bash
git rm public/assets/redline-clips/02-chaos-to-paid.mp4 \
       public/assets/redline-clips/02-chaos-to-paid.prompt.txt \
       public/assets/redline-clips/03-operator-control.mp4 \
       public/assets/redline-clips/03-operator-control.prompt.txt
git commit -m "chore: drop unused anime mascot clips from public assets"
```

Watch `01-invoice-tunnel.mp4` first — keep if abstract, drop if anime. Adjust the `git rm` accordingly.

## What to do today (priority order)

### Tier 1 — show humans (highest leverage, zero code)

1. **Send 5 cold DMs.** Templates ready at `~/knowledge-base/projects/redline/launch-posts.md`.
   - 3 LinkedIn DMs to bookkeepers
   - 2 Reddit posts (r/smallbusiness, r/freelance)
   - Goal: 1 reply, not 1 signup

### Tier 2 — unblock

2. Apply migration 0008 (above)
3. (Optional) Stripe Connect webhook (above)

### Tier 3 — small ship-ready wins

4. Pricing page at `/pricing` (use mockup aesthetic + Stripe price IDs from env)
5. Plausible analytics (paste script in `app/layout.tsx`, register domain in dashboard)
6. Unpause logins when first DM-recruited user is ready to test

### Tier 4 — defer until first paying user

- Demo mode (`/demo` seeded data, no auth)
- Wire mockups (invoice-detail, settings, etc.)

## How to resume me tomorrow

Paste any of these to skip context-rebuild:

- `Wire pricing page into /pricing. Use Stripe price IDs from env. Match aesthetic.`
- `Add Plausible analytics. Domain redlineinvoices.com. Paste in app/layout.tsx.`
- `Build /demo route — seeded read-only dashboard, no auth.`
- `Review onboarding tour copy + tighten to 60-second flow.`
- `Wire mockup X into route Y.` (replace X, Y from mockups/README.md table)

## Origin / posture (don't sound desperate)

Pitch when asked "why did you build this":
> "I saw an inefficiency, so I had to solve it."

Frame as side project. Not startup, not launching, not seeking users.

Full DM/post copy: `~/knowledge-base/projects/redline/launch-posts.md`.
