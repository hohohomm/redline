# invoiceapp — Repo Rules

Both Claude and Codex read this when working inside this repo.

## Read first (universal rules)

- `~/knowledge-base/core/code-style.md`
- `~/knowledge-base/core/agent-rules.md`
- `~/knowledge-base/projects/invoiceapp/overview.md`
- This file (project-specific overrides below)

## Scope lock (this repo only)

ALLOWED to touch:
- `lib/**`, `app/**`, `components/**`, `types/**`, `supabase/migrations/**`, `middleware.ts`, `vercel.json`, `package.json`, `scripts/**`

NEVER touch:
- `node_modules`, `.next`, `.env.local`, `.git`
- Any file outside this repo

## Stack (locked — do not change)

Next.js 14 App Router · TypeScript · Supabase (DB + auth) · Stripe · Resend · Vercel · Tailwind + shadcn

## Env vars

See `.env.local.example`. Local values live in `.env.local` (gitignored). Production values are set via Vercel dashboard or `vercel env add`.

## Database

- Migrations live in `supabase/migrations/` named `NNNN_description.sql`.
- Every table has Row Level Security ON.
- Every policy restricts rows to `auth.uid() = user_id` or equivalent.
- Run migrations manually in the Supabase SQL editor — do not auto-apply.

## Weekly build prompts

Per-week tasks live in `~/knowledge-base/projects/invoiceapp/weekly-prompts/weekN.md`. Paste the relevant one into the agent session.
