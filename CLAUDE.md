# invoiceapp — Repo Rules

These rules apply to Claude, Codex, or any agent working in this repo.

## Scope lock

ALLOWED to touch:
- `lib/**`, `app/**`, `components/**`, `types/**`, `supabase/migrations/**`, `middleware.ts`, `vercel.json`, `package.json`, `scripts/**`

NEVER touch:
- `node_modules`, `.next`, `.env.local`, `.git`
- Any file outside this repo

## Code style

- Write code a smart 6-year-old could follow. No exceptions.
- Obvious variable names. Flat structure. Plain-English comments only where the WHY is not obvious.
- Never write comments that describe WHAT code does — well-named code already does that.
- No clever one-liners. Split complex things into readable steps.
- No nested function hierarchies. Sequential and flat wins.
- No type hints or docstrings on code you didn't change.

## What NOT to do

- NEVER add code beyond exactly what the task asks. No bonus features.
- No extra error handling for cases that cannot happen.
- No abstractions built for hypothetical future use.
- No premature optimization.

## Workflow

1. List files you will create or edit BEFORE writing code.
2. Write the code.
3. Run `npx tsc --noEmit`. Fix any errors.
4. Summary in 5 bullets or fewer.

Do NOT run `npm run build`. Do NOT run `next dev`. User will test manually.

## Stack (locked — do not change)

Next.js 14 App Router · TypeScript · Supabase (DB + auth) · Stripe · Resend · Vercel · Tailwind + shadcn

## Env vars

See `.env.local.example`. Local values live in `.env.local` (gitignored). Production values are set via Vercel dashboard or `vercel env add`.

## Database

- Migrations live in `supabase/migrations/` named `NNNN_description.sql`.
- Every table has Row Level Security ON.
- Every policy restricts rows to `auth.uid() = user_id` or equivalent.
- Run migrations manually in the Supabase SQL editor — do not auto-apply.
