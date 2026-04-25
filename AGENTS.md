# invoiceapp — Agent Rules (Codex)

Mirror of `CLAUDE.md`. Codex reads this file.

## Read first (universal rules)

- `~/knowledge-base/core/code-style.md`
- `~/knowledge-base/core/agent-rules.md`
- `~/knowledge-base/projects/invoiceapp/overview.md`
- `CLAUDE.md` in this repo — keep that and this file in sync

## Scope lock (this repo only)

ALLOWED to touch:
- `lib/**`, `app/**`, `components/**`, `types/**`, `supabase/migrations/**`, `middleware.ts`, `vercel.json`, `package.json`, `scripts/**`

NEVER touch:
- `node_modules`, `.next`, `.env.local`, `.git`
- Any file outside this repo

## Stack (locked)

Next.js 14 App Router · TypeScript · Supabase (DB + auth) · Stripe · Resend · Vercel · Tailwind + shadcn

## Weekly prompts

Per-week task prompts: `~/knowledge-base/projects/invoiceapp/weekly-prompts/weekN.md`.

## Keeping the knowledge base current

When you learn something reusable (a workaround, a pattern, a project decision), follow the protocol in `~/knowledge-base/workflows/update-kb.md`.


<claude-mem-context>
# Memory Context

# [RedLine] recent context, 2026-04-25 1:54pm GMT+10

No previous sessions found.
</claude-mem-context>