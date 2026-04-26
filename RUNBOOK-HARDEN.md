# Hardening Deploy Runbook — Pre-ship

Eight-step ordered checklist for deploying pre-ship hardening (Track 5). Each step includes verification command.

---

## 1. Supabase Migrations

**Step**: Paste both migration files into Supabase SQL editor and run manually.

- **Migration 0009**: `supabase/migrations/0009_settings_business.sql` (business identity + defaults)
  
  Verify:
  ```sql
  SELECT column_name FROM information_schema.columns 
  WHERE table_name='user_settings' 
  AND column_name IN ('business_name','business_email','abn','default_payment_terms','reminder_tone');
  ```
  Expect 5 rows.

- **Migration 0010**: `supabase/migrations/0010_referrals.sql` (referral tracking)
  
  Verify:
  ```sql
  SELECT proname FROM pg_proc 
  WHERE proname IN ('my_referral_count','ensure_referral_code');
  ```
  Expect 2 rows.

---

## 2. Deploy

**Step**: Push to main and wait for Vercel build to complete.

```bash
git push origin main
```

Verify: Open Vercel dashboard, confirm build succeeded. Check deploy status and wait for green checkmark.

---

## 3. Post-Deploy Health

**Step**: Check health endpoint returns 200 with all checks OK.

```bash
curl https://redlineinvoices.com/api/health
```

Expect: HTTP 200, JSON `{"ok": true}`, all nested checks are `true`.

---

## 4. Post-Deploy Smoke (Playwright)

**Step**: Run hardening + smoke tests against production.

```bash
PLAYWRIGHT_BASE_URL=https://redlineinvoices.com npx playwright test
```

Expect: All 8 public smoke tests + 3 hardening tests pass (no failures).

---

## 5. Legal Spot Check

**Step**: Confirm ABN footer disclosure renders on legal pages.

Navigate to:
- `https://redlineinvoices.com/privacy`
- `https://redlineinvoices.com/terms`

Expect: Each page footer shows: _RedLine is operated by [NAME], ABN [ABN]. Contact: support@redlineinvoices.com_

---

## 6. Real Email Round-Trip

**Step**: Send a real invoice email end-to-end (uses existing auth'd user on prod DB).

1. Sign in (login still paused — use a test account already in prod).
2. Create a test invoice for your own email.
3. Click Send.

Verify: Email arrives from verified Resend domain within 2 minutes.

---

## 7. Unpause Logins

**Step**: Remove or toggle off LOGIN_PAUSED environment variable on Vercel.

```bash
vercel env ls
```

Confirm `LOGIN_PAUSED` is listed.

```bash
vercel env rm LOGIN_PAUSED production
```

Or via Vercel dashboard: set `LOGIN_PAUSED=false`.

Redeploy:
```bash
vercel deploy --prod
```

Verify: Visit `https://redlineinvoices.com/login`, submit email, receive magic link, sign in, reach `/dashboard`.

---

## 8. Post-Launch Monitor

**Step**: Set up automated uptime monitoring on `/api/health`.

- Go to [UptimeRobot](https://uptimerobot.com) (free tier).
- Create new HTTP monitor:
  - URL: `https://redlineinvoices.com/api/health`
  - Interval: 5 min (free tier default).
  - HTTP method: GET.
  - Threshold: 2 consecutive failures → email alert.

Verify: Monitor is listed as active. Test by manually triggering a check (green checkmark appears within seconds).
