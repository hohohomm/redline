# Mockups — visual reference

Standalone HTML files. **NOT integrated. Reference only.**

## How to view

Double-click any `.html`. Or:

```bash
open /Users/phillippreketes/Documents/RedLine/mockups/invoice-detail.html
# or all at once
open /Users/phillippreketes/Documents/RedLine/mockups/*.html
```

No server, no build, no framework. Pure HTML + inline CSS + tiny vanilla JS where needed.

## Files → routes (where they wire when ready)

| Mockup | Wires to | Status |
|--------|----------|--------|
| `invoice-detail.html` | `app/dashboard/invoices/[id]/page.tsx` | not wired |
| `public-invoice.html` | `app/pay/[token]/page.tsx` (new public route) | not wired |
| `settings.html` | `app/dashboard/settings/page.tsx` | not wired |
| `client-detail.html` | `app/dashboard/clients/[id]/page.tsx` (new) | not wired |
| `activity-feed.html` | `app/dashboard/activity/page.tsx` (new) | not wired |
| `email-templates-preview.html` | preview pane in settings/sequences | not wired |
| `empty-states.html` | reference for empty states across app | n/a |
| `error-pages.html` | `not-found.tsx`, `error.tsx`, `/maintenance` | not wired |
| `mobile-dashboard.html` | responsive variant of dashboard | n/a |
| `magic-link-landing.html` | `app/pay/[token]/done/page.tsx` (post-pay) | not wired |

## Aesthetic spec

Each file defines CSS vars at top. Match `components/redline-prototype.jsx`:

```css
--graphite-900: #08090b   /* page bg */
--graphite-700: #101116   /* card bg */
--hair:         #2a2c33   /* borders */
--warm-white:   #f5f1ea   /* primary text */
--ash:          #a6a2a0   /* secondary text */
--redline:      #ff4b3e   /* accent + CTA */
```

Headings: weight 500, letter-spacing -0.035em. Body: SF Pro / system stack.

## How to wire one into Next.js

1. Pick a mockup.
2. Confirm route path from table above. Create dir if needed.
3. Convert HTML → React server component:
   - Inline styles → keep `style={{}}` OR move to `globals.css`
   - Static demo data → Supabase fetch (use existing `lib/supabase/server.ts` pattern)
   - All queries must respect RLS (`auth.uid() = user_id`)
4. Hook into existing API routes for actions (send/pay/edit).
5. Test on `localhost:2999` before deploy.

## Demo data conventions

Fake data used across all mockups:
- Acme Corp, Bob's Plumbing, Tide Studio
- $4,250, $890, $2,100 (AUD)
- INV-1024, INV-1019, INV-1031

When wiring real data, replace these. Don't ship hardcoded.

## Don't

- Import these files. They're visual only.
- Copy `<style>` blocks straight into Next.js. Extract or scope.
- Trust the demo numbers — replace before launch.
